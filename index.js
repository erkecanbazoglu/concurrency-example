// Importing axios
import axios from "axios";
import fs from "fs";
// Request n amount of users from randomuser.me
const getUsers = async () => {
  const response = await axios.get(
    `https://randomuser.me/api/?results=${1}&nat=us&page=1`
  );
  return response.data.results.map((user) => ({
    name: `${user.name.first} ${user.name.last}`,
    firstName: user.name.first,
    lastName: user.name.last,
    email: user.email,
    age: user.dob.age,
    gender: user.gender,
    nationality: user.nat,
  }))[0];
};

async function main() {
  const numberOfAPICalls = 20;

  // Sync version
  console.time("getUsers Sync");
  for (let i = 0; i < numberOfAPICalls; i++) {
    const user = await getUsers();
    // write user to csv
    fs.appendFileSync("users-sync.csv", `${user.name},${user.email}\n`);
  }
  console.timeEnd("getUsers Sync");

  // Async version
  console.time("getUsers Async");
  const promises = [];
  for (let i = 0; i < numberOfAPICalls; i++) {
    promises.push(getUsers());
  }
  const users = await Promise.all(promises);
  // write users to csv
  fs.appendFileSync(
    "users-async.csv",
    users.map((user) => `${user.name},${user.email}\n`).join("")
  );
  console.timeEnd("getUsers Async");
}

main();
