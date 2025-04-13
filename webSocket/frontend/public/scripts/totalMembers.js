const endpoint = "http://localhost:3000/api/v1/auth/users_number";
const totalMembersEl = document.querySelector("#total-members");

export const fetchTotalMembers = async () => {
  try {
    const { data } = await axios.get(endpoint);
    totalMembersEl.textContent = data;
  } catch (e) {}
};
