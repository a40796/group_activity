<template>
  <div class="d-flex initiatedEvent">
    <SideBar :routerLinkData="routerLinkData" />
    <div class="initiated-events-area">
      <div v-if="initiatedEvents && initiatedEvents.length > 0">
        <div
          class="initiated-event white-bg"
          v-for="(item, idx) in showPageEvents"
          :key="idx"
        >
          <div class="initiated-event-container">
            <div class="ellipsis event-name">{{ item.eventName }}</div>
            <div class="text-gray">
              {{
                `${formattedDateTime(item.startTime)} - ${formattedDateTime(
                  item.endTime
                )}`
              }}
            </div>
            <div class="mt-3 d-flex justify-content-start">
              <button
                class="btn btn-primary"
                type="button"
                data-bs-toggle="modal"
                :data-bs-target="'#editEventModal' + item.uuid"
              >
                Edit Event
              </button>
            </div>
            <div
              class="modal fade"
              :id="'editEventModal' + item.uuid"
              tabindex="-1"
              aria-labelledby="editEventModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog d-flex align-items-center justify-content-center">
                <EditEvent
                  :editEvent="item"
                  @event-updated="handleEventUpdated"
                ></EditEvent>
              </div>
            </div>
          </div>
        </div>
        <div class="pagination-area" v-if="initiatedEvents.length > 5">
          <nav aria-label="Page navigation example">
            <ul class="pagination">
              <li
                class="page-item"
                @click="handlePagination('Previous')"
                v-if="pagination.pre"
              >
                <a class="page-link" href="#">Previous</a>
              </li>
              <li
                class="page-item"
                @click="handlePagination('Next')"
                v-if="pagination.next"
              >
                <a class="page-link" href="#">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div v-else class="d-flex align-items-center">No ongoing events at the moment</div>
    </div>
  </div>
</template>

<script>
import SideBar from "../components/unit/SideBar";
import { onMounted, ref } from "vue";
import { callApi } from "../plugins/apiService.js";
import EditEvent from "../components/EditEvent";
export default {
  name: "IntiatedEventPage",
  components: {
    SideBar,
    EditEvent,
  },
  setup() {
    const initiatedEvents = ref([]);
    const routerLinkData = [
      {
        path: "/dashboard/initiateEvent",
        title: "Initiate Event",
      },
      {
        path: "/dashboard/initiatedEvent",
        title: "Initiated Event",
      },
    ];

    const formattedDateTime = (date) => {
      const month = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const originalDate = new Date(date);
      return `${
        month[originalDate.getMonth()]
      } ${originalDate.getDate()}, ${originalDate.getFullYear()} ${originalDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${originalDate.getMinutes().toString().padStart(2, "0")}`;
    };
    const showPageEvents = ref({});
    const pagination = ref({
      pre: false,
      next: false,
    });

    const togglePaginationButton = () => {
      pagination.value.pre = !pagination.value.pre;
      pagination.value.next = !pagination.value.next;
    };

    const handlePagination = (page) => {
      togglePaginationButton();
      const pageSize = 5;
      const startIndex = page === "Previous" ? 0 : pageSize;
      showPageEvents.value = initiatedEvents.value.slice(
        startIndex,
        startIndex + pageSize
      );
    };

    const getEventData = async () => {
      try {
        initiatedEvents.value = await callApi("/events");
        if (initiatedEvents.value.length > 5) {
          showPageEvents.value = initiatedEvents.value.slice(0, 5);
          pagination.value.pre = false;
          pagination.value.next = true;
        } else {
          showPageEvents.value = initiatedEvents.value;
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    const handleEventUpdated = (updatedEvent) => {
      const index = initiatedEvents.value.findIndex(
        (item) => item.uuid === updatedEvent.uuid
      );
      if (index !== -1) {
        initiatedEvents.value[index] = updatedEvent;
      }
    };

    onMounted(() => {
      getEventData();
    });

    return {
      routerLinkData,
      initiatedEvents,
      formattedDateTime,
      handleEventUpdated,
      showPageEvents,
      pagination,
      handlePagination,
    };
  },
};
</script>

<style scoped>
.initiatedEvent {
  width: 100%;
  height: 100%;
}
.initiated-events-area {
  width: 100%;
  padding: 30px;
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.initiated-events-area > div {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.initiated-event {
  width: 80%;
  margin: 10px 0;
  padding: 0;
}

.initiated-event-container {
  padding: 10px;
  font-size: 16px;
}

.modal-content {
  width: 1220px !important;
  height: 825px;
  padding: 35px 35px 0 35px !important;
}

.modal-dialog {
  height: 94%;
}

.pagination-area {
  width: 80%;
  display: flex;
  justify-content: end;
}

.event-name {
  font-weight: bold;
}
</style>
