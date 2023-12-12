<template>
  <div class="d-flex profile-page">
    <SideBar />
    <router-view></router-view>
  </div>
</template>

<script>
import SideBar from "../components/unit/SideBar.vue";
export default {
  name: "ProfilePage",
  components: { SideBar },
  setup() {
  },
};
</script>

<style scoped>
.profile-page {
  height: 100vh;
}
</style>
