<template>
  <div class="events-area">
    <div
      class="event white-bg pt-3"
      v-for="event in allEventsRef.events"
      :key="event.uuid"
    >
      <div class="fw-bold d-flex justify-content-between event-title">
        {{ event.eventName }}
        <font-awesome-icon
          class="white-bg cursor-pointer fs-6 text-secondary"
          icon="fa-heart"
          title="Save"
        />
      </div>
      <div class="event-info">
        <div class="mt-3">
          <font-awesome-icon
            icon="location-dot"
            class="text-primary"
            title="Event Location"
          />
          <span class="ms-3 text-secondary fs-6">{{ event.location }}</span>
        </div>
        <div class="event-date fs-6 text-secondary">
          <font-awesome-icon
            icon="fa-calendar"
            class="text-secondary"
            title="Event Time"
          />
          <span class="ms-3">
            {{ new Date(event.startTime).getFullYear() }}
            {{ new Date(event.startTime).toLocaleString("en-US", { month: "short" }) }}
            {{ new Date(event.startTime).getDate() }}</span
          >
        </div>
        <div class="d-flex mt-1">
          <font-awesome-icon
            icon="fa-user"
            class="text-secondary"
            title="Event attendance ratio"
          />
          <div class="progress-bar ms-3">
            <div
              class="progress"
              :style="{
                width:
                  (!event.joinUserId
                    ? 0
                    : event.joinUserId.length / parseInt(event.selectNum)) *
                    100 +
                  '%',
              }"
            ></div>
          </div>
          <div class="ms-3 progress-statics">
            {{
              `${event.joinUserId ? calcJoinNums(event.joinUserId) : 0} / ${
                event.selectNum
              }`
            }}
          </div>
        </div>
      </div>
      <div class="event-buttons">
        <button type="button" class="btn btn-light">
          <font-awesome-icon
            class="fs-6 text-secondary"
            icon="fa-circle-info"
            title="event informations"
          />
        </button>
        <button
          type="button"
          class="btn btn-light ms-1"
          @click="showDialog(event)"
          v-if="store.state.user.uid !== event.userId"
        >
          <font-awesome-icon
            class="fs-6 text-secondary"
            icon="fa-plus"
            title="join event"
          />
        </button>
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
  <div>
    <CustomizeDialog
      :is-visible="isDialogVisible"
      @close="closeDialog"
      @ok="handleOk"
      :title="`<span class='fs-6'>Are you sure to join</span> <span class='fs-8'>${
        dialogEvent ? dialogEvent.eventName : ''
      }</span>`"
    >
      <template #content>
        <div class="check-event-content">
          <div>Please select the number of participants</div>
          <input type="number" v-model="selectedNumber" min="1" :max="dialogEvent.selectNum" />
        </div>
      </template>
    </CustomizeDialog>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { callApi } from "../plugins/apiService.js";
import { useStore } from "vuex";
import { showToastMessage } from "/src/common.js";
import { Toast } from "bootstrap";
import CustomizeDialog from "/src/components/unit/CustomizeDialog.vue";
export default {
  name: "EventPage",
  components: {
    CustomizeDialog,
  },
  setup() {
    const currentPage = ref("1");
    const allEventsRef = ref({});
    const progress = ref(0);
    const store = useStore();
    const isDialogVisible = ref(false);
    const selectedNumber = ref(1);
    const dialogEvent = ref();

    const showDialog = (event) => {
      dialogEvent.value = event;
      isDialogVisible.value = true;
    };

    const closeDialog = () => {
      isDialogVisible.value = false;
      selectedNumber.value = 1
    };

    const handleOk = () => {
      joinEvent(dialogEvent.value);
    };

    const calcJoinNums = (arr) => {
      return arr.reduce((acc, curr) => {
        const value = Number(Object.values(curr)[0]);
        return acc + (isNaN(value) ? 0 : value);
      }, 0);
    };

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
      getEventsByPage(page);
    };

    const joinEvent = async (event) => {
      try {
        const eventObject = JSON.parse(JSON.stringify(event));
        eventObject.joinUserId = { [store.state.user.uid]: selectedNumber.value };

        const requestOptions = {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ event: eventObject }),
        };

        const updatedEventData = await callApi(
          "/allEvents/" + event.userId,
          "PUT",
          requestOptions,
          store,
          Toast
        );

        if (updatedEventData && updatedEventData.data) {
          const index = allEventsRef.value.events.findIndex(
            (event) => event.uuid === updatedEventData.data.uuid
          );
          if (index !== -1) {
            allEventsRef.value.events[index] = updatedEventData.data;
          }
          showToastMessage(updatedEventData.msg, "success", store);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    onMounted(() => {
      getEventsInit();
    });

    return {
      currentPage,
      allEventsRef,
      onClickHandler,
      progress,
      store,
      joinEvent,
      isDialogVisible,
      showDialog,
      closeDialog,
      selectedNumber,
      handleOk,
      dialogEvent,
      calcJoinNums,
    };
  },
};
</script>

<style scoped>
.events-area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 30px 50px 0 50px;
  overflow: auto;
}
.event {
  width: 420px;
  height: 230px;
  margin: 20px 10px;
  border-radius: 10px;
}

.event-title {
  height: 50px;
}

.event-buttons {
  display: flex;
  justify-content: end;
  margin-top: 20px;
}

.event-buttons > .btn {
  line-height: 15px;
}

.progress-statics {
  height: 20px;
  line-height: 20px;
  font-size: 12px;
}

.pagination-area {
  width: 100%;

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
  background-color: white;
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

.progress-bar {
  width: 70%;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress {
  background-color: #3498db;
  transition: width 0.3s ease;
}

.check-event-content {
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
</style>
