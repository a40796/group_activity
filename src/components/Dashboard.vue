<template>
  <nav class="navbar navbar-expand-sm bg-light">
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
      Hi,<span class="text-primary">{{ dbUser.name }}</span>
    </div>
    <div
      class="d-flex justify-content-end me-3 align-items-center btn btn-outline-secondary"
      @click="logout"
    >
      <font-awesome-icon icon="sign-out-alt" title="log out" />
      <span class="ms-1">Logout</span>
    </div>
  </nav>
  <router-view> </router-view>
</template>

<script>
import { onMounted, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { callApi } from "../plugins/apiService.js";
export default {
  name: "DashboardPage",
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);
    const dbUser = computed(() => store.state.dbUser);
    const router = useRouter();
    const routerActive = computed(() => {
      return router.currentRoute.value.path;
    });

    onMounted(async () => {
      try {
        const userData = await callApi("/account");
        store.dispatch("addUser", userData);
        store.commit("dbUser", JSON.parse(JSON.stringify(userData)));
      } catch (error) {
        router.push("/");
      }
    });

    const logout = async () => {
      const res = await callApi("/logout");
      if (res) {
        router.push("/");
      }
    };

    return {
      user,
      dbUser,
      logout,
      routerActive,
    };
  },
};
</script>

<style scoped>
.username {
  width: 20%;
}
.logout-btn {
  background-color: white; /* Set the background color to white */
  padding: 5px 10px; /* Adjust padding as needed */
  border-radius: 4px; /* Rounded corners */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1); /* Add a subtle box shadow */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
</style>
