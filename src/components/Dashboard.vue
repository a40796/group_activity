<template>
  <nav class="navbar navbar-expand-sm bg-light" v-if="store.state.user">
    <div class="container-fluid">
      <ul class="navbar-nav">
        <li class="nav-item fw-bolder">
          <router-link
            class="nav-link"
            :class="{ 'text-primary': routerActive === '/dashboard/event' }"
            to="/dashboard/event"
            >Event</router-link
          >
        </li>
        <li class="nav-item fw-bolder">
          <router-link
            class="nav-link"
            :class="{ 'text-primary': routerActive === '/dashboard/initiateEvent' }"
            to="/dashboard/initiateEvent"
            >Initiate an Event</router-link
          >
        </li>
        <li class="nav-item fw-bolder">
          <router-link
            class="nav-link"
            :class="{
              'text-primary':
                routerActive === '/dashboard/profilePage/information' ||
                routerActive === '/dashboard/profilePage/activity',
            }"
            to="/dashboard/profilepage"
            >Profile</router-link
          >
        </li>
      </ul>
    </div>
    <div class="d-flex justify-content-end pe-5 username">
      Hi,<span class="text-primary fw-bold">{{ dbUser.name }}</span>
    </div>
    <div
      class="d-flex justify-content-end me-3 align-items-center btn btn-outline-secondary"
      @click="logout"
    >
      <font-awesome-icon icon="sign-out-alt" title="log out" />
      <span class="ms-1">Logout</span>
    </div>
  </nav>
  <nav class="navbar navbar-expand-sm bg-light d-flex justify-content-end px-3" v-else>
    <div class="btn btn-outline-secondary" @click="showDialog">Sign up</div>
     <CustomizeDialog
      :is-visible="isDialogVisible"
      @close="closeDialog"
      @ok="handleSignup"
      :customizeOk="`Sign Up`"
      :signupRef="signupRef"
    >
      <template #content>
        <SignupForm :signupRef="signupRef"></SignupForm>
      </template>
    </CustomizeDialog>
  </nav>
  <router-view> </router-view>
</template>

<script>
import { onMounted, computed, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { callApi } from "../plugins/apiService.js";
import CustomizeDialog from "/src/components/unit/CustomizeDialog.vue";
import SignupForm from "/src/components/SignUP.vue"
export default {
  name: "DashboardPage",
  components: {
    CustomizeDialog,
    SignupForm
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);
    const dbUser = computed(() => store.state.dbUser);
    const router = useRouter();
    const routerActive = computed(() => {
      return router.currentRoute.value.path;
    });
    const isDialogVisible = ref(false);
    const signupRef = ref(false)

    onMounted(async () => {
      try {
        const userData = await callApi("/account");
        store.dispatch("addUser", userData);
        store.commit("dbUser", JSON.parse(JSON.stringify(userData)));
      } catch (error) {
        router.push("/dashboard/event");
      }
    });

    const logout = async () => {
      const res = await callApi("/logout");
      if (res) {
        router.push("/");
      }
    };

    const showDialog = () => {
      isDialogVisible.value = true
    }

    const handleSignup = () => {
      signupRef.value = true
    }

    return {
      user,
      dbUser,
      logout,
      routerActive,
      store,
      showDialog,
      isDialogVisible,
      handleSignup,
      signupRef
    };
  },
};
</script>

<style scoped>
.username {
  width: 20%;
}
.logout-btn {
  background-color: white;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
</style>
