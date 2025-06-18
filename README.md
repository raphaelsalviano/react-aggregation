# react-aggregation

[![npm version](https://img.shields.io/npm/v/react-aggregation.svg)](https://www.npmjs.com/package/react-aggregation)
[![License](https://img.shields.io/npm/l/react-aggregation.svg)](https://github.com/seuusuario/react-aggregation/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.8.4-blue.svg)](https://www.typescriptlang.org/)

Uma biblioteca TypeScript para criar pipelines de agregação em aplicações React, inspirada na sintaxe de agregação do
MongoDB, permitindo filtrar, transformar e manipular dados de forma eficiente.

## Índice

- [Instalação](#instalação)
- [Configuração e Uso](#configuração)
- [Estágios Suportados](#estágios-suportados)
- [Tipos](#tipos)
- [Contribuição](#contribuição)
- [Código de Conduta](#código-de-conduta)
- [Licença](#licença)

## Instalação

A biblioteca pode ser instalada usando os seguintes métodos:

### Usando npm

```bash
npm install react-aggregation
```

### Usando yarn

```bash
yarn add react-aggregation
```

Após a instalação, você pode importá-la para começar a usá-la em sua aplicação React.

## Configuração

Para utilizar o `react-aggregation` com qualquer banco de dados, é necessário criar um adaptador personalizado que fará
a interface entre a biblioteca e o banco de dados escolhido.

### 1. Criando um adaptador para Banco de Dados

O componente principal para utilizar a biblioteca com seu banco de dados preferido é o adaptador. Abaixo está um exemplo
de como criar um adaptador personalizado:

```typescript
import {DatabaseAdapter, DefaultObject, PipelineStage} from 'react-aggregation';
import sift from 'sift';

// Adaptador personalizado para seu banco de dados
export class MyAdapterDatabase implements DatabaseAdapter {

    // Implementação do estágio $match (filtragem)
    async matchStage<T = DefaultObject>(
        collection: DefaultObject[],
        criteria: PipelineStage
    ): Promise<T[]> {
        try {
            // Usando sift para implementar consultas estilo MongoDB
            const filteredCollection = collection.filter(sift(criteria));
            return filteredCollection as T[];
        } catch (error) {
            console.error('Erro ao executar estágio $match:', error);
            return [] as T[];
        }
    }

    // Métodos auxiliares específicos para seu banco
    private async obterDadosDoBanco(collectionName: string): Promise<any[]> {
        // Implemente a lógica específica do seu banco de dados
        // Retorne os dados como array de objetos
        return [];
    }

}
```

### Exemplo completo com Realm

Segue um adaptador específico para o Realm:

```typescript
import {DatabaseAdapter, DefaultObject, PipelineStage} from 'react-aggregation';
import Realm from 'realm';
import sift from 'sift';

export class RealmAdapter implements DatabaseAdapter {
    private realmInstance?: Realm;

    // Método para inicializar o Realm
    async initialize(
        schemas: Realm.ObjectSchema[],
        partition: string,
        path: string,
        networkuser: string,
        token: string
    ): Promise<boolean> {
        try {
            if (!schemas || !schemas.length) {
                throw new Error('Schemas são obrigatórios');
            }

            const realmAccessBehavior: Realm.OpenRealmBehaviorConfiguration = {
                type: 'downloadBeforeOpen' as Realm.OpenRealmBehaviorType,
                timeOutBehavior: 'openLocalRealm' as Realm.OpenRealmTimeOutBehavior,
                timeOut: 900000,
            };

            const anonymousUser = await this.loginCustomRealm(networkuser, token);

            const realmConfiguration: Realm.Configuration = {
                schema: schemas,
                path: path,
                sync: {
                    newRealmFileBehavior: realmAccessBehavior,
                    existingRealmFileBehavior: realmAccessBehavior,
                    user: anonymousUser as unknown as Realm.User,
                    partitionValue: partition,
                    onError: (_session, error) => console.error('Error on sync:', error),
                },
            };

            this.realmInstance = await Realm.open(realmConfiguration);
            return !!this.realmInstance;
        } catch (error) {
            console.error('Erro ao inicializar Realm:', error);
            return false;
        }
    }

    // Implementação de getCollection para Realm
    async getCollection<T = DefaultObject>(collectionName: string): Promise<T[]> {
        if (!this.realmInstance) {
            throw new Error('Realm não foi inicializado');
        }

        try {
            const objects = this.realmInstance.objects<T>(collectionName);
            return Array.from(objects).map(obj => this.serializeRealmObject(obj)) as T[];
        } catch (error) {
            console.error(`Erro ao obter coleção ${collectionName}:`, error);
            return [] as T[];
        }
    }

    // Implementação de toArray para Realm
    async toArray<T = DefaultObject>(collection: never): Promise<T[]> {
        const objects = collection as unknown as Realm.Results<any>;
        return Array.from(objects).map(obj => this.serializeRealmObject(obj)) as T[];
    }

    // Implementação de matchStage para Realm
    async matchStage<T = DefaultObject>(
        collection: DefaultObject[],
        criteria: PipelineStage
    ): Promise<T[]> {
        try {
            // Usando sift para implementar consultas estilo MongoDB
            const filteredCollection = collection.filter(sift(criteria));
            return filteredCollection as T[];
        } catch (error) {
            console.error('Erro ao executar estágio $match:', error);
            return [] as T[];
        }
    }

    // Auxiliar para serializar objetos Realm
    private serializeRealmObject<T>(obj: T): T {
        if (!obj) return obj;

        // Realm.Object tem um método toJSON, mas às vezes é necessário
        // fazer uma serialização manual para objetos aninhados
        return JSON.parse(JSON.stringify(obj));
    }

    // Método para autenticação no Realm
    private async loginCustomRealm(networkuser: string, token: string): Promise<Realm.User> {
        // Implemente a lógica de autenticação do Realm
        // Este é apenas um exemplo e deve ser adaptado ao seu caso

        const credentials = Realm.Credentials.jwt(token);
        const app = new Realm.App({id: networkuser});
        return app.logIn(credentials);
    }

    // Método para fechar conexão
    async close(): Promise<boolean> {
        if (this.realmInstance) {
            this.realmInstance.close();
            this.realmInstance = null;
            return true;
        }
        return false;
    }

}
```

### 2. Configurando a biblioteca

Uma vez criado o adaptador, você precisa configurá-lo para uso com a biblioteca:

```typescript
import {DatabaseConfig} from 'react-aggregation';
import {RealmAdapter} from './adapters/realmAdapter';
import {aggregate} from 'react-aggregation';
import {ProdutoSchema, UsuarioSchema} from './schemas';

// Criar e inicializar o adaptador Realm
const realmAdapter = new RealmAdapter();
await realmAdapter.initialize(
    [ProdutoSchema, UsuarioSchema],
    'minha_particao',
    'caminho_do_banco',
    'usuario_auth',
    'token_auth'
);

// Configurar a biblioteca
const databaseConfigs: DatabaseConfig[] = [
    {
        defaultAdapter: realmAdapter,
        rules: {
            collections: ['Produto', 'Usuario']
        }
    }
];

// Exemplo de uso da função aggregate
async function buscarProdutosAtivos() {
    // Pipeline de agregação com vários estágios
    const aggregationPipeline = [
        {$match: {ativo: true}},
        {$sort: {preco: -1}},
        {$limit: 10}
    ];

    // Executar a agregação
    const resultado = await aggregate('Produto', aggregationPipeline, databaseConfigs);

    console.log('Produtos ativos:', resultado);
    return resultado;
}

```

### 3. Usando estágios de agregação

A função suporta vários estágios de agregação, semelhantes aos do MongoDB: `aggregate`

```typescript
// Exemplo de pipeline com múltiplos estágios
const aggregationPipeline = [
    // Estágio $match - filtra documentos
    {$match: {categoria: 'eletrônicos', preco: {$gt: 1000}}},

    // Estágio $lookup - combina documentos de outra coleção
    {
        $lookup: {
            from: 'fabricantes',
            localField: 'fabricanteId',
            foreignField: '_id',
            as: 'fabricanteInfo'
        }
    },

    // Estágio $unwind - expande arrays
    {$unwind: '$fabricanteInfo'},

    // Estágio $project - seleciona campos específicos
    {
        $project: {
            nome: 1,
            preco: 1,
            'fabricanteInfo.nome': 1,
            desconto: {$multiply: ['$preco', 0.1]}
        }
    },

    // Estágio $sort - ordena resultados
    {$sort: {preco: -1}},

    // Estágio $limit - limita número de resultados
    {$limit: 5}
];

const resultado = await aggregate('Produto', aggregationPipeline, databaseConfigs);
```

### 4. Integrando com Componentes React

Aqui está um exemplo de como integrar a biblioteca com componentes React:

```typescript jsx
import React, {useEffect, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import {aggregate} from 'react-aggregation';
import {databaseConfigs} from './database/config';

interface Produto {
    id: string;
    nome: string;
    preco: number;
    categoria: string;
}

const ProdutosScreen: React.FC = () => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const buscarProdutos = async () => {
            try {
                // Pipeline com múltiplos estágios
                const aggregationPipeline = [
                    {$match: {categoria: 'eletrônicos'}},
                    {$sort: {preco: -1}},
                    {$limit: 20}
                ];

                // Executar agregação
                const resultado = await aggregate<Produto>(
                    'Produto',
                    aggregationPipeline,
                    databaseConfigs
                );

                setProdutos(resultado);
            } catch (error) {
                console.error('Erro ao buscar produtos:', error);
            } finally {
                setLoading(false);
            }
        };

        buscarProdutos();
    }, []);

    if (loading) {
        return (
            <View>
                <Text>Carregando produtos...</Text>
            </View>
        );
    }

    return (
        <View>
            <Text>Produtos Eletrônicos</Text>
            <FlatList
                data={produtos}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <View>
                        <Text>{item.nome}</Text>
                        <Text>R$ {item.preco.toFixed(2)}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default ProdutosScreen;
```

## Estágios Suportados

A biblioteca atual suporta os seguintes estágios de agregação:

| Estágio        | Descrição                                                                  |
|----------------|----------------------------------------------------------------------------|
| `$addFields`   | Adiciona novos campos aos documentos                                       |
| `$count`       | Conta documentos no pipeline                                               |
| `$facet`       | Processa múltiplos pipelines de agregação em paralelo                      |
| `$group`       | Agrupa documentos por uma expressão especificada                           |
| `$limit`       | Limita o número de documentos passados para o próximo estágio              |
| `$lookup`      | Realiza um "join" com documentos de outra coleção                          |
| `$match`       | Filtra documentos para passar apenas aqueles que correspondem às condições |
| `$project`     | Seleciona campos específicos dos documentos                                |
| `$replaceRoot` | Substitui o documento por um documento especificado                        |
| `$search`      | Realiza pesquisa de texto                                                  |
| `$skip`        | Pula um número específico de documentos                                    |
| `$sort`        | Ordena documentos                                                          |
| `$unwind`      | Deconstruir um campo de array em múltiplos documentos                      |

## Tipos

Aqui você encontra os `types` da biblioteca.

```typescript
// Tipos básicos
export type DefaultObject = Record<string, any>;
export type PipelineStage = Record<string, any>;
export type AggregationPipeline = PipelineStage[];

// Interface do adaptador de banco de dados
export interface DatabaseAdapter {
    // Implementa a operação de match (filtragem)
    matchStage<T = DefaultObject>(
        collection: DefaultObject[],
        pipeline: PipelineStage
    ): Promise<T[]>;
}

// Configurações de regras para banco de dados
export interface DatabaseRules {
    /**
     * Coleções disponíveis a serem utilizadas
     * pela instancia de database
     */
    collections: string[];
}

// Configuração completa do banco de dados
export interface DatabaseConfig {
    defaultAdapter: DatabaseAdapter;
    rules: DatabaseRules;
}
```

## Contribuição

Agradecemos seu interesse em contribuir para o projeto `react-aggregation`! Sua ajuda é fundamental para melhorar e
expandir a biblioteca. Abaixo estão as diretrizes para contribuir.

### Como Contribuir

1. **Fork do Repositório**
    - Faça um fork do projeto para sua conta GitHub
    - Clone o repositório para seu ambiente local:

```shell
   git clone https://github.com/seu-usuario/react-aggregation.git
   cd react-aggregation
```

2. **Configuração do Ambiente**
    - Instale as dependências:

```shell
   yarn install
```

    - Compile o projeto:

```shell
   yarn build
```

3. **Crie uma Branch**
    - Crie uma branch para sua contribuição:

```shell
   git checkout -b feature/nome-da-sua-feature
```

- Use prefixos que indicam o tipo de contribuição:
    - `feature/` para novas funcionalidades
    - `fix/` para correção de bugs
    - `docs/` para melhorias na documentação
    - `test/` para adição ou melhoria de testes

4. **Desenvolvimento**
    - Implemente suas alterações seguindo o estilo de código do projeto
    - Adicione ou atualize testes relevantes
    - Execute os testes para garantir que tudo está funcionando:

```shell
   yarn test
```

5. **Envie sua Contribuição**
    - Commit suas alterações com mensagens claras:

```shell
   git commit -m "feat: adiciona suporte para estágio $replaceWith"
```

- Envie para seu repositório:

```shell
   git push origin feature/nome-da-sua-feature
```

6. **Crie um Pull Request**
    - Abra um Pull Request (PR) para o repositório principal
    - Descreva detalhadamente suas alterações
    - Referencie quaisquer issues relacionadas

### Diretrizes de Código

- Mantenha o código limpo e bem documentado
- Siga as convenções de nomenclatura existentes
- Adicione JSDoc para novas funções e métodos
- Mantenha a cobertura de testes alta para novas funcionalidades

### Áreas para Contribuição

- **Novos Estágios de Agregação**: Implementação de estágios ainda não suportados
- **Otimizações de Performance**: Melhorias no desempenho dos estágios existentes
- **Adaptadores para Bancos de Dados**: Implementações para outros bancos de dados
- **Documentação**: Exemplos, tutoriais e melhorias na documentação
- **Testes**: Expansão da cobertura de testes e casos de teste

### Relatando Bugs

Se você encontrar bugs ou problemas, por favor:

1. Verifique se o problema já foi reportado
2. Use o template de bug report para fornecer:
    - Versão da biblioteca
    - Ambiente (versão de Node.js, React, sistema operacional)
    - Passos para reproduzir
    - Comportamento esperado vs. comportamento atual
    - Screenshots ou logs se aplicável

### Solicitando Funcionalidades

Para solicitar novas funcionalidades:

1. Descreva claramente o que você gostaria de ver implementado
2. Explique por que esta funcionalidade seria útil para a comunidade
3. Forneça exemplos de como a funcionalidade poderia ser usada

## Código de Conduta

### Nosso Compromisso

No interesse de promover um ambiente aberto e acolhedor, nós, como contribuidores e mantenedores, nos comprometemos a
tornar a participação em nosso projeto uma experiência livre de assédio para todos, independentemente de idade, tamanho
corporal, deficiência, etnia, identidade e expressão de gênero, nível de experiência, nacionalidade, aparência, raça,
religião ou identidade e orientação sexual.

### Nossos Padrões

Exemplos de comportamento que contribuem para criar um ambiente positivo incluem:

- Usar linguagem acolhedora e inclusiva
- Respeitar pontos de vista e experiências diferentes
- Aceitar críticas construtivas graciosamente
- Focar no que é melhor para a comunidade
- Mostrar empatia para com outros membros da comunidade

Exemplos de comportamento inaceitável incluem:

- Uso de linguagem ou imagens sexualizadas
- Trolling, comentários insultuosos/depreciativos e ataques pessoais ou políticos
- Assédio público ou privado
- Publicação de informações privadas de terceiros sem permissão explícita
- Outra conduta que poderia ser considerada inadequada em um ambiente profissional

### Responsabilidades

Os mantenedores do projeto são responsáveis por esclarecer os padrões de comportamento aceitável e espera-se que tomem
ações corretivas apropriadas em resposta a quaisquer instâncias de comportamento inaceitável.
Os mantenedores do projeto têm o direito e a responsabilidade de remover, editar ou rejeitar comentários, commits,
código, edições de wiki, questões e outras contribuições que não estejam alinhadas com este Código de Conduta, ou banir
temporária ou permanentemente qualquer contribuidor por outros comportamentos que consideram inadequados, ameaçadores,
ofensivos ou prejudiciais.

## Licença

O projeto react-aggregation é licenciado sob a [Licença MIT](https://opensource.org/licenses/MIT).

```
MIT License

Copyright (c) 2023 react-aggregation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

A licença MIT é uma licença permissiva, o que significa que:

- Você pode usar o código livremente em projetos pessoais e comerciais
- Você pode modificar e distribuir o código
- Você pode incluir o código em projetos com licenças diferentes
- A única obrigação é incluir uma cópia da licença MIT e aviso de copyright em qualquer cópia do software/código-fonte

Esta licença foi escolhida para maximizar a reutilização e contribuição ao projeto, mantendo requisitos mínimos para
usuários finais.
