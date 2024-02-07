<template>
  <div class="events-area">
    <div
      class="event white-bg pt-3"
      v-for="event in allEventsRef.events"
      :key="event.uuid"
    >
      <div class="fw-bold d-flex justify-content-between">
        {{ event.eventName }}
        <font-awesome-icon
          class="white-bg cursor-pointer fs-6 text-secondary"
          icon="fa-heart"
          title="Save"
        />
      </div>
      <div class="mt-3">
        <font-awesome-icon
          icon="location-dot"
          class="text-primary"
          title="Event Location"
        />
        <span class="ms-3 text-secondary fs-6">{{ event.location }}</span>
      </div>
      <div class="event-date fs-6 text-secondary">
        <font-awesome-icon icon="fa-calendar" class="text-secondary" title="Event Time" />
        <span class="ms-3">
          {{ new Date(event.startTime).getFullYear() }}
          {{ new Date(event.startTime).toLocaleString("en-US", { month: "short" }) }}
          {{ new Date(event.startTime).getDate() }}</span
        >
      </div>
      <div>
        <font-awesome-icon
          icon="fa-user"
          class="text-secondary"
          title="Event Organizer"
        />
        <span class="ms-3 fs-6 text-secondary">{{ event.userName }}</span>
      </div>
    </div>
  </div>
  <div class="pagination-area">
    <vue-awesome-paginate
      :total-items="allEventsRef.totalItems"
      :items-per-page="12"
      :max-pages-shown="3"
      v-model="currentPage"
      :on-click="onClickHandler"
    />
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { callApi } from "../plugins/apiService.js";
export default {
  name: "EventPage",
  setup() {
    const currentPage = ref("1");
    const allEventsRef = ref({});
    /**
     * @function
     * 得到第一頁資料,並計算分頁頁數
     */
    const getEventsInit = async () => {
      const allEventData = await callApi(`/allEvents?page=${currentPage.value}`, "GET");
      allEventsRef.value = allEventData;
    };

    /**
     * @function
     * 藉由分頁得到分頁event資料
     */
    const getEventsByPage = async (page) => {
      const eventsData = await callApi(`/allEvents?page=${page}`, "GET");
      allEventsRef.value = eventsData;
    };

    /**
     * @function
     * 得到當前分頁
     */
    const onClickHandler = (page) => {
      getEventsByPage(page)
    };

    onMounted(() => {
      getEventsInit();
    });

    return {
      currentPage,
      allEventsRef,
      onClickHandler
    };
  },
};
</script>

<style scoped>
.events-area {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 30px 50px 0 50px;
  min-height: calc(100% - 200px);
  max-height: calc(100% - 150px);
  overflow: auto;
}
.event {
  width: 420px;
  height: 200px;
  margin: 20px 10px;
  border-radius: 10px;
}

.pagination-area {
  width: 100%;
  position: fixed;
  top: 93%;
  padding: 0 90px;
  display: flex;
  justify-content: end;
}

.pagination-area >>> .pagination-container {
  display: flex;
  column-gap: 2px;
}

.pagination-area >>> .paginate-buttons {
  height: 40px;
  width: 40px;
  cursor: pointer;
  border: none;
  background-color:white;
  color: black;
}

.pagination-area >>> .paginate-buttons:hover {
  background-color: #d8d8d8;
}

.pagination-area >>> .active-page {
  background-color: #3498db;
  border: 1px solid #3498db;
  color: black;
}

.pagination-area >>> .active-page:hover {
  background-color: #2988c8;
}
</style>
