<template>
  <div class="events-area" >
    <div class="event white-bg pt-3" v-for="event in allEvents" :key="event.uuid">
      <div class="fw-bold d-flex justify-content-between">
        {{ event.eventName }}
        <font-awesome-icon class="white-bg cursor-pointer fs-6" icon="fa-heart" />
      </div>
      <div class="mt-3">
        <font-awesome-icon icon="location-dot" class="text-primary" />
        <span class="ms-3 text-secondary fs-6">{{ event.location }}</span>
      </div>
      <div class="event-date fs-6 text-secondary">
        <font-awesome-icon icon="fa-calendar" class="text-secondary" />
        <span class="ms-3">
          {{ new Date(event.startTime).getFullYear() }}
          {{ new Date(event.startTime).toLocaleString("en-US", { month: "short" }) }}
          {{ new Date(event.startTime).getDate() }}</span
        >
      </div>
    </div>
  </div>
  <div
    class="pagination-area"
  >
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li
          class="page-item"
          :class="{ disabled: pageNumbers[0] === parseInt(currentPage) }"
        >
          <a class="page-link" href="#" @click="handlePreNextPage('pre')">Previous</a>
        </li>
        <li
          v-for="(item, idx) in page"
          :key="idx"
          class="page-item"
          @click="getEventsByPage(idx + 1)"
        >
          <a class="page-link" href="#">{{ idx + 1 }}</a>
        </li>
        <li
          class="page-item"
          :class="{
            disabled: pageNumbers[pageNumbers.length - 1] === parseInt(currentPage),
          }"
        >
          <a class="page-link" href="#" @click="handlePreNextPage('next')">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { callApi } from "../plugins/apiService.js";
export default {
  name: "EventPage",
  setup() {
    const allEvents = ref([]);
    const currentPage = ref("1");
    const page = ref(0);
    const pageNumbers = ref([]);

    /**
     * @function
     * 得到第一頁資料,並計算分頁頁數
     */
    const getEventsInit = async () => {
      const allEventData = await callApi(`/allEvents?page=${currentPage.value}`, "GET");
      console.log("allEventData", allEventData);
      const { events, itemsPerPage, totalItems } = allEventData;
      allEvents.value = events;
      page.value = Math.ceil(totalItems / itemsPerPage);
      pageNumbers.value = Array.from({ length: page.value }, (_, idx) => idx + 1);
    };

    /**
     * @function
     * 藉由分頁得到分頁event資料
     */
    const getEventsByPage = async (page) => {
      const eventsData = await callApi(`/allEvents?page=${page}`, "GET");
      allEvents.value = eventsData.events;
      currentPage.value = eventsData.currentPage;
      console.log("eventsData", eventsData);
    };

    /**
     * @function
     * 處理分頁 next, previous 邏輯
     */
    const handlePreNextPage = (flag) => {
      const targetPage =
        flag === "pre"
          ? parseInt(currentPage.value) - 1
          : parseInt(currentPage.value) + 1;
      if (targetPage >= 1 && targetPage <= page.value) {
        getEventsByPage(targetPage.toString());
      }
    };

    onMounted(() => {
      getEventsInit();
    });

    return {
      allEvents,
      page,
      getEventsByPage,
      handlePreNextPage,
      currentPage,
      pageNumbers,
    };
  },
};
</script>

<style scoped>
.events-area {
  width: 100%;
  height:100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 30px 50px 0 50px;
}
.event {
  width: 420px;
  height: 200px;
  margin: 0 5px;
  border-radius: 10px;
}

.pagination-area {
  display: flex;
  justify-content: end;
  padding: 0 50px 10px 50px;
}
</style>
