<template>
  <form class="ms-3 p-3 white-bg eidt-area w-100 modal-content">
    <div class="d-flex justify-content-end" v-if="editEvent">
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="modal"
        aria-label="Close"
      ></button>
    </div>
    <div class="d-flex box-container">
      <div>
        <h5 class="text-primary">event setting</h5>
        <InputField
          label="Event Name"
          type="text"
          :editable="editable"
          :value="eventInfo.eventName"
          @updateValue="updateFieldValue('eventName', $event)"
        />
        <InputField
          label="Location"
          type="text"
          :editable="editable"
          :value="eventInfo.location"
          @updateValue="updateFieldValue('location', $event)"
        />
        <div class="d-flex flex-column">
          <label for="exampleSelect" class="form-label"
            >Event Guidelines and Announcements
          </label>
          <textarea
            class="textArea white-bg"
            id="story"
            name="story"
            rows="5"
            cols="30"
            v-model="eventInfo.announcements"
            :disabled="!editable"
          ></textarea>
        </div>
        <div class="container p-0 mt-3">
          <div class="form-group">
            <label for="exampleSelect" class="form-label">Number of Participants:</label>
            <input
              type="range"
              class="form-range"
              min="1"
              max="10"
              step="1"
              id="numberSelect"
              v-model="eventInfo.selectNum"
            />
            <input
              class="form-control white-bg numberSelect"
              v-model="eventInfo.selectNum"
              :disabled="!editable"
            />
          </div>
        </div>
        <div class="mt-3">
          <label for="exampleSelect" class="form-label">Event Time:</label>
          <div class="d-flex justify-content-left align-items-center mt-1">
            <div class="startTitle">Start:</div>
            <VueDatePicker
              class="datePicker white-bg"
              v-model="eventInfo.startTime"
              :disabled="!editable"
              :minDate="getMinDate()"
            />
          </div>
          <div class="d-flex justify-content-left align-items-center mt-1">
            <div class="endTitle">End:</div>
            <VueDatePicker
              class="datePicker white-bg"
              v-model="eventInfo.endTime"
              :disabled="!editable"
              :minDate="getMinDate()"
            />
          </div>
        </div>
      </div>
      <div class="w-100 ps-3">
        <h5 class="text-primary">Event Picture:</h5>
        <div class="mt-1">
          <label for="inputFile" class="custom-file-upload bg-secondary">
            <span>Upload Event Image</span>
            <input
              type="file"
              id="inputFile"
              ref="fileInput"
              multiple
              @input="handleImageUpload"
              :disabled="!editable"
            />
          </label>
          <div class="upload-image-area">
            <thead class="mb-3 white-bg">
              <tr class="w-100">
                <th>Images</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(image, index) in eventInfo.images"
                :key="index"
                class="d-flex mb-1"
              >
                <img :src="image.url" alt="Uploaded Image" class="upload-image me-1" />
                <textarea
                  class="textArea white-bg imgTextArea ms-3"
                  :value="eventInfo.images[index].desc"
                  @keyup="handlePhotoDesc(index, $event)"
                  placeholder="Enter event photo description."
                  v-if="image.uploadToCloud"
                  :disabled="!image.isEditing"
                ></textarea>
                <textarea
                  v-else
                  class="textArea white-bg imgTextArea ms-3"
                  disabled
                ></textarea>
                <div class="upload-btn-area">
                  <font-awesome-icon
                    class="ms-3 cursor-pointer"
                    icon="edit"
                    @click="eventInfo.images[index].isEditing = true"
                    :class="{
                      'disabled-icon': eventInfo.images[index].isEditing === editable,
                    }"
                    v-if="!image.isEditing"
                  />
                  <font-awesome-icon
                    class="ms-3 cursor-pointer"
                    icon="check-circle"
                    @click="eventInfo.images[index].isEditing = false"
                    v-if="image.isEditing"
                  />
                  <font-awesome-icon
                    class="ms-3 cursor-pointer"
                    icon="trash"
                    :class="{
                      'disabled-icon': eventInfo.images[index].isEditing === editable,
                    }"
                    @click="deletePhoto(index)"
                  />
                </div>
              </tr>
            </tbody>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-center p-3 line">
      <button
        type="button"
        class="btn btn-primary me-3"
        @click="editable = !editable"
        v-if="editable"
      >
        Save
      </button>
      <button
        type="button"
        class="btn btn-primary me-3"
        @click="editable = !editable"
        v-if="!editable"
      >
        Edit
      </button>
      <button
        type="button"
        class="btn btn-primary me-3"
        @click="applyEventInfo"
        v-if="!editable && !editEvent"
      >
        Apply
      </button>
      <button
        type="button"
        class="btn btn-primary me-3"
        @click="updateEventInfo"
        v-if="!editable && editEvent"
      >
        Update
      </button>
    </div>
  </form>
</template>

<script>
import InputField from "../components/unit/InputField";
import { callApi } from "../plugins/apiService.js";
import { ref, reactive, onMounted, toRefs } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useStore } from "vuex";
import { Toast } from "bootstrap";
import { useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import _debounce from "lodash/debounce";

export default {
  name: "EditEvent",
  components: {
    InputField,
    VueDatePicker,
  },
  props: {
    editEvent: Object,
  },
  setup(props, { emit }) {
    const { editEvent } = toRefs(props);
    const store = useStore();
    const router = useRouter();
    const editable = ref(true);
    let eventInfo = reactive({
      eventName: "",
      location: "",
      announcements: "",
      selectNum: "1",
      startTime: "",
      endTime: "",
      images: [],
    });

    if (editEvent.value) {
      eventInfo.eventName = editEvent.value.eventName;
      eventInfo.location = editEvent.value.location;
      eventInfo.announcements = editEvent.value.announcements;
      eventInfo.selectNum = editEvent.value.selectNum;
      eventInfo.startTime = editEvent.value.startTime;
      eventInfo.endTime = editEvent.value.endTime;
      eventInfo.images = editEvent.value.images;
    }

    const uploadFile = ref([]);
    const inputFile = ref(null);
    const images = reactive([]);
    const photoDesc = ref("");

    const getMinDate = () => {
      const today = new Date();
      today.setDate(today.getDate());
      return today.toISOString().split("T")[0];
    };

    const handlePhotoDesc = _debounce((index, e) => {
      photoDesc.value = e.target.value;
      eventInfo.images[index].desc = e.target.value;
      eventInfo.images[index].isEditing = false;
    }, 500);

    const handleImageUpload = async (e) => {
      uploadFile.value.push(e.target.files[0]);
      const files = inputFile.value.files;

      if (eventInfo.images.length >= 4) {
        store.dispatch("failedMsg", "Upload up to four photos at most.");
        const toast = new Toast(document.querySelector(".toast"));
        toast.show();
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = URL.createObjectURL(file);
        images.push({ url: imageUrl, file, isEditing: true });
      }
      eventInfo.images = images;

      const formData = new FormData();
      for (const file of uploadFile.value) {
        formData.append("images", file);
      }

      const requestOptions = {
        body: formData,
      };
      const firebaseDbImages = await callApi(
        "/events/uploadImage",
        "POST",
        requestOptions
      );
      firebaseDbImages.forEach((url, idx) => {
        eventInfo.images[idx].url = url;
        eventInfo.images[idx].uploadToCloud = true;
      });
    };

    const updateFieldValue = (field, event) => {
      eventInfo[field] = event.target.value;
    };

    const applyEventInfo = async () => {
      try {
        const eventSettingInfo = {
          event: {
            eventName: eventInfo.eventName,
            location: eventInfo.location,
            announcements: eventInfo.announcements,
            selectNum: eventInfo.selectNum,
            startTime: eventInfo.startTime,
            endTime: eventInfo.endTime,
            images: eventInfo.images.map(({ url, desc }) => ({ url, desc })),
            uuid: uuidv4(),
          },
        };

        const requestOptions = {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventSettingInfo),
        };
        const eventData = await callApi("/events", "POST", requestOptions, store, Toast);

        if (eventData.errorMsg) {
          return;
        }
        
        store.dispatch("successMsg", eventData.msg);
        const toast = new Toast(document.querySelector(".toast"));
        toast.show();
        setTimeout(() => {
          router.push("/dashboard/initiatedEvent");
        }, 2000);
      } catch (error) {
        console.error("error:", error);
      }
    };

    const updateEventInfo = async () => {
      try {
        const updatedSettingInfo = {
          event: {
            eventName: eventInfo.eventName,
            location: eventInfo.location,
            announcements: eventInfo.announcements,
            selectNum: eventInfo.selectNum,
            startTime: eventInfo.startTime,
            endTime: eventInfo.endTime,
            images: eventInfo.images.map(({ url, desc }) => ({ url, desc })),
            uuid: editEvent.value.uuid,
          },
        };

        const requestOptions = {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSettingInfo),
        };

        const updatedEventData = await callApi(
          "/events/" + editEvent.value.uuid,
          "PUT",
          requestOptions
        );
        
        emit("event-updated", updatedEventData.data);
        store.dispatch("successMsg", updatedEventData.msg);
        const toast = new Toast(document.querySelector(".toast"));
        toast.show();
      } catch (error) {
        console.log("error", error);
      }
    };

    const deletePhoto = (idx) => {
      eventInfo.images.splice(idx, 1);
    };

    onMounted(() => {
      inputFile.value = document.getElementById("inputFile");
    });

    return {
      editable,
      VueDatePicker,
      inputFile,
      images,
      handleImageUpload,
      eventInfo,
      updateFieldValue,
      applyEventInfo,
      handlePhotoDesc,
      deletePhoto,
      getMinDate,
      updateEventInfo,
    };
  },
};
</script>

<style scoped>
.box-container {
  margin-bottom: 30px;
}

.numberSelect,
.form-range {
  width: 400px;
}
.datePicker {
  width: 340px;
  margin-left: 20px;
}
.startTitle,
.endTitle {
  width: 40px;
}

.upload-image {
  width: 100px;
  height: 100px;
  border: 1px solid #80808024;
}

.upload-image-area {
  display: flex;
  flex-direction: column;
  /* height: 572px, hard code now shoub be fixed */
  height: 572px;
  width: 700px;
  padding: 10px;
  border: 1px solid #80808045;
  margin-top: 20px;
}

.upload-image-area thead tr th {
  font-weight: 200;
}

.upload-image-area thead tr th:first-child {
  width: 100px;
}

.upload-image-area thead tr th:nth-child(2) {
  width: 420px;
  padding-left: 20px;
}

.upload-image-area thead tr th:last-child {
  width: 100px;
  padding-left: 30px;
}

.custom-file-upload {
  display: inline-block;
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.custom-file-upload:hover {
  background-color: #0056b3;
}

.upload-btn-area {
  width: 100px;
  display: flex;
  justify-content: center;
}

input[type="file"] {
  display: none;
}
.textArea {
  width: 400px;
  resize: none;
}

.line {
  border-top: 1px solid #8080803d;
}

.disabled-icon {
  opacity: 0.5;
  pointer-events: none;
}
</style>
