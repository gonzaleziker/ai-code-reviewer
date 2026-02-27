// Sample code with bugs and issues for testing

// 1. Bug: Using var instead of const/let
var name = "John";
var age = 25;

// 2. Bug: Global variable pollution
function greet() {
  message = "Hello, " + name;
  console.log(message);
}

// 3. Performance: Inefficient loop
function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// 4. Security: SQL injection vulnerability
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return database.execute(query);
}

// 5. Bug: Missing error handling
function divide(a, b) {
  return a / b;
}

// 6: Readability: Poor naming
function p(x) {
  return x * 2;
}

// 7: Bug: Mutable default argument
function addItem(item, list = []) {
  list.push(item);
  return list;
}

// 8: Security: eval usage
function executeCode(code) {
  eval(code);
}

// 9: Performance: Creating new array in loop
function processData(data) {
  const results = [];
  for (let i = 0; i < data.length; i++) {
    results.push(data[i] * 2);
  }
  return results;
}

// 10: Best practice: No async error handling
async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
