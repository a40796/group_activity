<template>
  <div class="login">
    <div class="login-box">
      <h2 class="text-primary">Login</h2>
      <form @submit.prevent="login">
        <div class="white-bg mb-3">
          <input type="text" v-model="email" placeholder="Email" required />
        </div>
        <div class="password-input white-bg mb-3">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Password"
            required
          />
          <font-awesome-icon
            class="ms-1"
            :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
            @click="togglePasswordVisibility"
          />
        </div>
        <button type="submit">Login</button>
        <div class="text-danger mt-3" v-if="signupHint">No account, please sign up first</div>
      </form>
      <div>
      </div>
    </div>
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
    const showPassword = ref(false);
    const signupHint = ref(false)

    const login = async () => {
      try {
        const data = {
          email: email.value,
          password: password.value,
        };
        const user = await loginUser(data);
        if(!user){
          signupHint.value = true
          return 
        }
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

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      email,
      password,
      login,
      showPassword,
      togglePasswordVisibility,
      signupHint
    };
  },
};
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.login-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 400px;
  min-height: 400px;
  border-radius: 5px;
}

form {
  display: flex;
  flex-direction: column;
  padding-top: 50px;
  height: 250px;
}

form input {
  border: none;
  font-size:14px;
  width:250px;
}

input {
  width: 100%;
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

.password-input {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.password-input input {
  width: calc(100% - 30px);
  padding-right: 30px;
}
</style>
