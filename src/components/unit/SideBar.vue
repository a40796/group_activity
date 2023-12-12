<template>
  <!-- Sidebar -->
  <div class="profile-side-bar">
    <div class="p-3 me-3 d-flex flex-column align-items-center text-secondary">
      <div v-if="showUserShortName" class="circle">{{ userShortName }}</div>
      <img :src="userUrl" class="circle "/>
      <span class="mt-3 fs-6">{{ dbUser.name }}</span>
    </div>
    <UploadField />
    <nav id="sidebar" class="col-md-3 col-lg-2 d-md-block sidebar">
      <div class="d-flex justify-content-center">
        <ul class="nav flex-column">
          <li class="nav-item sidebar-button">
            <router-link
              :class="{
                'text-primary': routerActive === '/dashboard/profilePage/information',
                'text-secondary': routerActive !== '/dashboard/profilePage/information',
              }"
              class="nav-link"
              to="/dashboard/profilePage/information"
              >Personal Information</router-link
            >
          </li>
          <li class="nav-item sidebar-button mt-1">
            <router-link
              :class="{
                'text-primary': routerActive === '/dashboard/profilePage/activity',
                'text-secondary': routerActive !== '/dashboard/profilePage/activity',
              }"
              class="nav-link"
              to="/dashboard/profilePage/activity"
              >Personal Activity</router-link
            >
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script>
import UploadField from "./UploadField";
import { computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
export default {
  name: "SideBar",
  components: { UploadField },
  setup() {
    const router = useRouter();
    const store = useStore();
    const user = computed(() => store.state.user);
    const dbUser = computed(() => store.state.dbUser);
    const userUrl = computed(() => store.state.user.photoUrl);
    console.log('userUrl',userUrl.value)
    const showUserShortName = computed(() => {
      return !userUrl.value || userUrl.value.length === 0;
    });

    const userShortName = computed(() => {
      if (user.value.name) {
        const [abb] = user.value.name.split("");
        return abb.toUpperCase();
      }
      return "";
    });
    const routerActive = computed(() => {
      return router.currentRoute.value.path;
    });
    watchEffect(() => {
      if (routerActive.value === "/dashboard/profilepage") {
        router.push("/dashboard/profilePage/information");
      }
    });

    return { routerActive, dbUser, userShortName, userUrl, showUserShortName };
  },
};
</script>

<style scoped>
.profile-side-bar {
  width: 25%;
  background-color: #f0f0f84a;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.profile-side-bar > div {
  margin-top: 3.5rem;
}
.circle {
  width: 150px;
  border-radius: 50%;
  text-align: center;
  line-height: 100px;
  color: #ffffff;
  margin-top: 5rem;
}
.sidebar {
  width: 100%;
}
.sidebar > div {
  margin-top: 30px;
}
.sidebar-button {
  background-color: white;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.photo-img {
  width: 150px;
}
</style>
