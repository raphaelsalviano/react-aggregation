export function extractValueToObject(field: string, obj: any): any {
  let value: any = undefined;

  const fieldSplit: string[] = field.split('.');

  for (let i = 0; i < fieldSplit.length; i++) {
    if (i === 0) {
      if (Object.keys(obj).includes(fieldSplit[0])) {
        if (Array.isArray(obj[fieldSplit[0]])) {
          value = obj?.[fieldSplit[0]]?.[0];
        } else {
          value = obj?.[fieldSplit[0]];
        }
      } else {
        value = undefined;
      }
    } else {
      if (Object.keys(value || {}).includes(fieldSplit[i])) {
        if (Array.isArray(value[fieldSplit[i]])) {
          value = value?.[fieldSplit[i]]?.[0];
        } else {
          value = value?.[fieldSplit[i]];
        }
      } else {
        value = undefined;
      }
    }
  }

  return value;
}
