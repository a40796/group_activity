<template>
  <div class="d-flex justify-content-center">
    <h2 class="mb-3 text-primary">SIGN UP</h2>
  </div>
  <div class="sign-up">
    <div class="d-flex flex-column">
      <form class="signup-info" @submit.prevent="signup">
        <input
          class="white-bg mb-3 signup-input"
          type="text"
          v-model="email"
          placeholder="Email"
          required
        />
        <input
          class="white-bg mb-3 signup-input"
          type="password"
          v-model="password"
          placeholder="Password"
          required
        />
        <input
          class="white-bg mb-3 signup-input"
          type="text"
          v-model="name"
          placeholder="Name"
          required
        />
        <input
          class="white-bg mb-3 signup-input"
          type="text"
          v-model="phone"
          placeholder="Phone"
          required
        />
        <input
          class="white-bg mb-3 signup-input"
          type="text"
          v-model="address"
          placeholder="Address"
          required
        />
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
      </form>
      
    </div>
    <div class="d-flex flex-column align-items-center" style="width: 300px">
      <div v-if="!personImageUrl" class="person-image">
        <div class="custom-file-input">
          <label for="inputFile" class="file-label">
            <div class="icon">
              <font-awesome-icon
                icon="fa-solid fa-cloud-arrow-up"
                style="font-size: 30px; cursor: pointer"
              />
            </div>
            <div class="text">Select Profile Picture</div>
          </label>
          <input
            type="file"
            id="inputFile"
            ref="fileInput"
            multiple
            @change="handleImageUpload"
            style="display: none"
          />
        </div>
      </div>
      <img v-else :src="personImageUrl" class="person-uploaded-image" />
    </div>
   
  </div>
   <div class="mb-3  d-flex justify-content-center" v-if="signupCompleted">
        go to <span class="text-primary log-in ms-2 fw-bold" @click="goToLogin">LOGIN</span>
      </div>
</template>

<script>
import { ref, watch } from "vue";
import { useStore } from "vuex";
import { callApi } from "../plugins/apiService.js";
import { showToastMessage } from "/src/common.js";

export default {
  name: "SignupForm",
  components: {},
  props: {
    signupRef: Boolean,
  },
  setup(props, { emit }) {
    const store = useStore();
    const email = ref("");
    const password = ref("");
    const name = ref("");
    const phone = ref("");
    const address = ref("");
    const selectedGender = ref("male");
    const signupCompleted = ref(false);
    const personImageUrl = ref(null);

    watch(
      () => props.signupRef,
      (newValue) => {
        if (newValue) signup();
      }
    );

    const goToLogin = () => {
      emit("showLogin");
    };

    const signup = async () => {
      const data = {
        email: email.value,
        password: password.value,
        name: name.value,
        phone: phone.value,
        address: address.value,
        gender: selectedGender.value,
        photo:personImageUrl.value
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
        console.log("result", result);
        if (result.userData) signupCompleted.value = true;
        result.errorMsg
          ? showToastMessage(result.errorMsg, "error", store)
          : showToastMessage(result.msg, "success", store);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    const handlePersonImage = (url) => {
      personImageUrl.value = url;
    };

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);
      const requestOptions = {
        body: formData,
      };
      const firebaseDbImages = await callApi(
        "/signup/uploadImage",
        "POST",
        requestOptions
      );
      if (firebaseDbImages.url) {
        personImageUrl.value = firebaseDbImages.url[0];
      }

      console.log("firebaseDbImages", firebaseDbImages);
    };
    return {
      email,
      password,
      name,
      phone,
      signup,
      address,
      selectedGender,
      signupCompleted,
      goToLogin,
      handlePersonImage,
      handleImageUpload,
      personImageUrl,
    };
  },
};
</script>

<style scoped>
.sign-up {
  width: 550px;
  margin: 0 auto;
  border-radius: 5px;
  text-align: center;
  font-size: 14px;
  display: flex;
  justify-content: space-around;
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
.log-in {
  cursor: pointer;
  text-decoration: underline;
}

.signup-info {
  width: 300px;
}

.person-image {
  width: 90%;
  height: 100%;
  border: 1px dashed #adb5bd;
  margin-bottom: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.person-uploaded-image {
  width: auto;
  height: auto;
  max-width: 200px;
  border: 1px dashed #adb5bd;
}
</style>
