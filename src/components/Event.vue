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
          <span class="ms-3"
            >{{ parseEventTimePeriod(event.startTime, event.endTime) }}
          </span>
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
        <button type="button" class="btn btn-light" @click="showEventDetail(event)">
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
          <input
            type="number"
            v-model="selectedNumber"
            min="1"
            :max="dialogEvent.selectNum"
          />
        </div>
      </template>
    </CustomizeDialog>
  </div>
  <PopupWindow v-if="isPopupVisible" @hidePopupWindow="isPopupVisible = false">
    <template v-slot:detail>
      <div class="detail-popup">
        <div class="orange-color fw-bold mb-3 event-title d-flex justify-content-between event-name">
          <div>{{ detailEvent.eventName }}</div>
          <button
            type="button"
            class="btn-close "
            @click="isPopupVisible = false"
          ></button>
        </div>
        <div class="detail-popup-container">
          <div class="event-annoucement">{{ detailEvent.announcements }}</div>
          <div>
            <div class="text-primary fw-bold">Event time</div>
            <div>
              {{ parseEventTimePeriod(detailEvent.startTime, detailEvent.endTime) }}
            </div>
          </div>
          <div>
            <div class="text-primary fw-bold">Event location</div>
            <div>{{ detailEvent.location }}</div>
          </div>
          <div>
            <div class="text-primary fw-bold">Number of Events</div>
            <div>{{ detailEvent.selectNum }}</div>
          </div>
          <div>
            <div class="text-primary fw-bold">Event Number</div>
            <div>{{ detailEvent.uuid }}</div>
          </div>
          <div class="text-primary fw-bold">Event photo</div>
          <div class="detail-table">
            <DataTable :columns="detailColumns" :rows="detailRows"></DataTable>
          </div>
        </div>
      </div>
    </template>
  </PopupWindow>
</template>

<script>
import { onMounted, ref, reactive, computed } from "vue";
import { callApi } from "../plugins/apiService.js";
import { useStore } from "vuex";
import { showToastMessage } from "/src/common.js";
import { Toast } from "bootstrap";
import CustomizeDialog from "/src/components/unit/CustomizeDialog.vue";
import { useRouter } from "vue-router";
import { parseEventTimePeriod } from "/src/common.js";
import PopupWindow from "/src/components/unit/PopupWindow.vue";
import DataTable from "/src/components/unit/CustomizeDatatable.vue";
export default {
  name: "EventPage",
  components: {
    CustomizeDialog,
    DataTable,
    PopupWindow,
  },
  setup() {
    const currentPage = ref("1");
    const allEventsRef = ref({});
    const progress = ref(0);
    const store = useStore();
    const isDialogVisible = ref(false);
    const selectedNumber = ref(1);
    const dialogEvent = ref();
    const router = useRouter();
    const isPopupVisible = ref(false);
    const detailEvent = reactive({});

    const showDialog = (event) => {
      dialogEvent.value = event;
      isDialogVisible.value = true;
    };

    const closeDialog = () => {
      isDialogVisible.value = false;
      selectedNumber.value = 1;
    };

     const detailColumns = ref([
      {
        label: "Image",
        field: "image",
        width: "10%",
        isKey: true,
        display: function (row) {
          return `<image style="width:100px;height:100px" src="${row.image}">`;
        },
      },
      {
        label: "Description",
        field: "description",
        width: "10%",
        isKey: true,
      },
    ]);
    const detailRows = computed(() => {
      if (!detailEvent.images) {
        return {};
      }
      return detailEvent.images.map((item) => {
        return {
          image: item.url,
          description: item.desc,
        };
      });
    });

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
          router.push("/dashboard/profilePage/activity");
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    const showEventDetail = ({
      announcements,
      endTime,
      eventName,
      images,
      location,
      selectNum,
      startTime,
      uuid,
    }) => {
      isPopupVisible.value = true;
      detailEvent.announcements = announcements
      detailEvent.endTime = endTime
      detailEvent.eventName = eventName
      detailEvent.images = images
      detailEvent.location = location
      detailEvent.selectNum = selectNum
      detailEvent.startTime = startTime
      detailEvent.uuid = uuid
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
      parseEventTimePeriod,
      showEventDetail,
      isPopupVisible,
      detailEvent,
      detailColumns,
      detailRows
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

.btn-close{
  font-size:12px
}

.detail-table {
  max-height: 420px;
  overflow: auto;
}

.event-name{
  border-bottom:1px solid #8080803b;
}

.detail-popup-container{
  font-size:16px;
  color:gray;
}

</style>
