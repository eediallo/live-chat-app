import { fetchTotalMembers } from "./totalMembers.js";

const main = async () => {
  await fetchTotalMembers();
};

window.onload = main;
