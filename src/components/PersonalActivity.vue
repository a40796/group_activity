<template>
  <div class="person-activity-area">
    <h5 class="attended-events-title text-primary">Attended Events</h5>
    <div class="attended-events-table">
      <DataTable :columns="columns" :rows="rows" @open-detail="handleOpenDetail">
      </DataTable>
    </div>
    <div class="pagination-area">
        <vue-awesome-paginate
          :total-items="attendedEvents.length"
          :items-per-page="6"
          :max-pages-shown="3"
          v-model="currentPage"
          :on-click="getAttendedEvents"
        />
      </div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { callApi } from "../plugins/apiService.js";
import DataTable from "/src/components/unit/CustomizeDatatable.vue";
import { parseEventTimePeriod } from "/src/common.js";
export default {
  name: "PersonalActivity",
  components: { DataTable },
  setup() {
    const currentPage = ref("1");
    const attendedEvents = ref([]);
    const perpageAttendedEvents = ref([]);
    const columns = ref([
      {
        label: "EventName",
        field: "eventName",
        width: "10%",
        isKey: true,
      },
      {
        label: "Announcements",
        field: "announcements",
        width: "10%",
      },
      {
        label: "Location",
        field: "location",
        width: "10%",
      },
      {
        label: "Time",
        field: "time",
        width: "10%",
      },
      {
        label: "Detail",
        field: "detail",
        width: "6%",
        display: function (row) {
          return (
            '<button type="button" data-id="' +
            row.uuid +
            '" class="is-rows-el btn btn-primary detail-btn">Detail</button>'
          );
        },
      },
    ]);
    const rows = ref([]);

    const getAllEvents = async () => {
      try {
        const userData = await callApi(`/account`, "GET");
        const allEventData = await callApi(`/allEvents`, "GET");

        const eventsKey = userData.events.map((event) => Object.keys(event)[0]);

        attendedEvents.value = allEventData.allEvents.filter((event) =>
          eventsKey.includes(event.uuid)
        );
        getAttendedEvents(1);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    const handleOpenDetail = (id) => {
      console.log("id", id);
    };

    const getAttendedEvents = (page) => {
      const perpageItems = 6;
      perpageAttendedEvents.value = attendedEvents.value.slice(
        (page - 1) * perpageItems,
        page * perpageItems
      );

      if (rows.value.length > 0) {
        rows.value = [];
      }

      perpageAttendedEvents.value.forEach(
        ({ announcements, eventName, location, startTime, endTime, uuid }) => {
          rows.value.push({
            eventName,
            announcements,
            location,
            time: parseEventTimePeriod(startTime, endTime),
            uuid,
          });
        }
      );
    };

    onMounted(() => {
      getAllEvents();
    });
    return {
      columns,
      rows,
      handleOpenDetail,
      currentPage,
      getAttendedEvents,
      attendedEvents,
      perpageAttendedEvents,
    };
  },
};
</script>

<style scoped>
.person-activity-area {
  width: 100%;
  padding: 0 100px 0 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.attended-events-title {
  margin-bottom: 20px;
}

.attended-events-table{
  height:600px
}

.pagination-area {
  width: 100%;
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
</style>
