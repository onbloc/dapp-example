async function fetchQueryEval(rpcUrl, packagePath, functionName, args) {
  const encodedData = btoa(`${packagePath}.${functionName}(${args})`);
  const url = `https://${rpcUrl}/abci_query?path="vm/qeval"&data="${encodedData}"`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const encodedResponse = data?.result?.response?.ResponseBase?.Data;

    if (!encodedResponse) {
      return JSON.stringify(data, null, 2);
    }

    const decodedResponse = atob(encodedResponse);

    try {
      return evaluateExpressionToObject(decodedResponse);
    } catch {
      return decodedResponse;
    }
  } catch (error) {
    console.error('Error fetching or decoding data:', error);
    return null;
  }
}

function matchValues(str) {
  const regexp = /\((.*)\)/g;
  const result = str.match(regexp);
  if (result === null || result.length < 1) {
    return [];
  }
  return result;
}

function parseABCIValue(str) {
  const regexp = /\s.*$/;
  return str.replace(regexp, '').slice(1);
}

function evaluateExpressionToObject(evaluateExpression) {
  const result = matchValues(evaluateExpression);
  if (result.length === 0) {
    return evaluateExpression;
  }

  try {
    const objectStr = parseABCIValue(result[0]);
    const object = JSON.parse(JSON.parse(objectStr));

    return JSON.stringify(object, null, 2);
  } catch {
    return evaluateExpression;
  }
}

export { fetchQueryEval };
