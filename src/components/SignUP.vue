<template>
  <div class="sign-up">
    <h2 class="mb-3 text-primary">SIGN UP</h2>
    <form @submit.prevent="signup">
      <input class="white-bg mb-3 signup-input" type="text" v-model="email" placeholder="Email" required />
      <input class="white-bg mb-3 signup-input" type="password" v-model="password" placeholder="Password" required />
      <input class="white-bg mb-3 signup-input" type="text" v-model="name" placeholder="Name" required />
      <input class="white-bg mb-3 signup-input" type="text" v-model="phone" placeholder="Phone" required />
      <input class="white-bg mb-3 signup-input" type="text" v-model="address" placeholder="Address" required />
      <div class="d-flex pb-3">
        <input
          type="radio"
          id="male"
          name="gender"
          value="male"
          checked
          class="me-1"
          v-model="selectedGender"
        />
        <label for="male">Male</label>
        <input
          type="radio"
          id="female"
          name="gender"
          value="female"
          class="ms-3 me-1"
          v-model="selectedGender"
        />
        <label for="female">Female</label>
      </div>
      <!-- <button type="submit">Sign Up</button> -->
    </form>
    <!-- <div>
      go to <span class="text-primary"><router-link to="/">login</router-link></span>
    </div> -->
  </div>
</template>

<script>
import { ref, watch} from "vue";
import { useStore } from "vuex";
import { callApi } from "../plugins/apiService.js";
import {showToastMessage} from '/src/common.js'

export default {
  name: "SignupForm",
   props: {
    signupRef: Boolean,
  },
  setup(props) {
    const store = useStore();
    const email = ref("");
    const password = ref("");
    const name = ref("");
    const phone = ref("");
    const address = ref("");
    const selectedGender = ref("male");
     watch(
      () => props.signupRef,
      (newValue) => {
        if(newValue) signup()
      }
    );

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
        result.errorMsg ?  showToastMessage(result.errorMsg, 'error', store) :  showToastMessage(result.msg, 'success', store);
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
.sign-up {
  max-width: 300px;
  margin: 0 auto;
  border-radius: 5px;
  text-align: center;
  font-size:14px
}

.signup-input {
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
