<template>
  <div class="login">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input type="text" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <div>not have account, <router-link to="/signup">sign up</router-link> here</div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { callApi } from "../plugins/apiService.js";
export default {
  name: "LoginForm",
  setup() {
    const email = ref("");
    const password = ref("");
    const router = useRouter();
    const store = useStore();
    const login = async () => {
      try {
        const data = {
          email: email.value,
          password: password.value,
        };
        const user = await loginUser(data);
        store.dispatch("addUser", user);
        router.push("/dashboard/event");
      } catch (error) {
        console.error("Login error:", error);
      }
    };

    const loginUser = async (data) => {
      try {
        const requestOptions = {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        };
        const userData = await callApi("/login", "POST", requestOptions);
        return userData;
      } catch (error) {
        console.log("error", error);
      }
    };

    return {
      email,
      password,
      login,
    };
  },
};
</script>

<style scoped>
.login {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: center;
}

input {
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
