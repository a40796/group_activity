<template>
  <div class="d-flex w-100 intiateEvent">
    <div
      class="container profile w-100 d-flex justify-content-center align-items-center text-secondary flex-column"
    >
      <EditEvent/>
    </div>
  </div>
</template>

<script>
import EditEvent from '../components/EditEvent'
export default {
  name: "IntiateEventPage",
  components: {
    EditEvent
  },
  setup() {
  
    return {
    };
  },
};
</script>

<style scoped>
</style>
