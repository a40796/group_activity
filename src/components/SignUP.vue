<template>
  <div class="login">
    <h2>Sign Up</h2>
    <form @submit.prevent="signup">
      <input type="text" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <input type="text" v-model="name" placeholder="Name" required />
      <input type="text" v-model="phone" placeholder="Phone" required />
      <input type="text" v-model="address" placeholder="Address" required />
      <div class="d-flex pb-3">
        <input
          type="radio"
          id="male"
          name="gender"
          value="male"
          checked
          class="radioInput me-1"
          v-model="selectedGender"
        />
        <label for="male">Male</label>
        <input
          type="radio"
          id="female"
          name="gender"
          value="female"
          class="radioInput ms-3 me-1"
          v-model="selectedGender"
        />
        <label for="female">Female</label>
      </div>
      <button type="submit">Sign Up</button>
    </form>
    <div>
      go to <span class="text-primary"><router-link to="/">login</router-link></span>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";
import { Toast } from "bootstrap";
import { callApi } from "../plugins/apiService.js";

export default {
  name: "SignupForm",
  setup() {
    const store = useStore();
    const email = ref("");
    const password = ref("");
    const name = ref("");
    const phone = ref("");
    const address = ref("");
    const selectedGender = ref("male");
    const signup = async () => {
      const data = {
        email: email.value,
        password: password.value,
        name: name.value,
        phone: phone.value,
        address: address.value,
        gender: selectedGender.value,
      };
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };
      try {
        const result = await callApi("/signup", "POST", requestOptions);
        result.errorMsg ?  store.dispatch("failedMsg", result.errorMsg) :  store.dispatch("successMsg", result.msg);
        const toast = new Toast(document.querySelector(".toast"));
        toast.show();
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    return {
      email,
      password,
      name,
      phone,
      signup,
      address,
      selectedGender,
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

.radioInput {
  width: 10%;
  margin-bottom: 0;
}
</style>
