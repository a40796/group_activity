<template>
  <form class="ms-3 p-3 white-bg eidt-area w-100">
    <div class="d-flex box-container">
      <div class="setting-left-area">
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
            <select
              class="form-control white-bg numberSelect"
              id="numberSelect"
              v-model="eventInfo.selectNum"
            >
              <option
                v-for="(num, idx) in numOfParticipants"
                :key="idx"
                :disabled="!editable"
              >
                {{ num }}
              </option>
            </select>
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
            />
          </div>
          <div class="d-flex justify-content-left align-items-center mt-1">
            <div class="endTitle">End:</div>
            <VueDatePicker
              class="datePicker white-bg"
              v-model="eventInfo.endTime"
              :disabled="!editable"
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
            <div
              v-for="(image, index) in eventInfo.images"
              :key="index"
              class="d-flex mb-1"
            >
              <img :src="image.url" alt="Uploaded Image" class="upload-image me-1" />
              <textarea
                class="textArea white-bg imgTextArea ms-3"
                :value="eventInfo.images[index].desc"
                @input="handleDelayedPhotoDesc(index, $event)"
                placeholder="Enter event photo description."
                v-if="eventInfo.images.length !== 0"
                :disabled="!image.isEditing"
              ></textarea>
              <div class="upload-btn-area">
                 <font-awesome-icon class="ms-3" icon="edit" @click="eventInfo.images[index].isEditing = true;" v-if="!image.isEditing"/>
                 <font-awesome-icon class="ms-3"  icon="check-circle" @click="eventInfo.images[index].isEditing = false;" v-if="image.isEditing" />
                 <font-awesome-icon class="ms-3" icon="trash" @click="deletePhoto(index)" />
              </div>
            </div>
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
        v-if="!editable"
      >
        Apply
      </button>
    </div>
  </form>
</template>

<script>
import InputField from "../components/unit/InputField";
import { callApi } from "../plugins/apiService.js";
import { ref, reactive, onMounted } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useStore } from "vuex";
import { Toast } from "bootstrap";

export default {
  name: "EditEvent",
  components: {
    InputField,
    VueDatePicker,
  },
  setup() {
    const store = useStore();
    const editable = ref(true);
    const numOfParticipants = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const eventInfo = reactive({
      eventName: "",
      location: "",
      announcements: "",
      selectNum: "",
      startTime: "",
      endTime: "",
      images: [],
    });
    const uploadFile = ref([]);
    const inputFile = ref(null);
    const images = reactive([]);
    const photoDesc = ref("");
    let typingTimer = null;
    let hasEventPhoto = false;

    const handleDelayedPhotoDesc = (index, e) => {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        handlePhotoDesc(index, e);
      }, 500);
    };

    const handlePhotoDesc = (index, e) => {
      photoDesc.value = e.target.value;
      eventInfo.images[index].desc = e.target.value;
    };

    const handleImageUpload = (e) => {
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
        images.push({ url: imageUrl, file, isEditing:true});
      }

      eventInfo.images =
        eventInfo.images.length !== 0 && hasEventPhoto
          ? [...eventInfo.images, images[0]]
          : images;
    };

    const updateFieldValue = (field, event) => {
      eventInfo[field] = event.target.value;
    };

    const uploadImage = async () => {
      try {
        const formData = new FormData();
        for (const file of uploadFile.value) {
          formData.append("images", file);
        }
        for (const item of eventInfo.images) {
          formData.append("descs", item.desc);
        }

         for (const item of eventInfo.images) {
          formData.append("urls", item.url);
        }

        const requestOptions = {
          body: formData,
        };
        const data = await callApi("/events/uploadImage", "POST", requestOptions);
        store.dispatch("successMsg", data.msg);
        const toast = new Toast(document.querySelector(".toast"));
        toast.show();
        return data;
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };

    const applyEventInfo = async () => {
      try {
        const uploadResults = await uploadImage();
        console.log("uploadResults", uploadResults);

        const eventSettingInfo = {
          event: {
            eventName: eventInfo.eventName,
            location: eventInfo.location,
            announcements: eventInfo.announcements,
            selectNum: eventInfo.selectNum,
            startTime: eventInfo.startTime,
            endTime: eventInfo.endTime,
            photoDescs:eventInfo.images.map(item => item.desc),
            photoUrls:eventInfo.images.map(item => item.url),
          },
        };
        const requestOptions = {
          body: JSON.stringify(eventSettingInfo),
        };

        const eventData = await callApi("/events", "POST", requestOptions);

        // Handle the results as needed
        store.dispatch("successMsg", eventData.msg);
        const toast = new Toast(document.querySelector(".toast"));
        toast.show();
      } catch (error) {
        console.log("error", error);
      }
    };

    const getEventData = async () => {
      try {
        const data = await callApi("/events");
        console.log('data',data)
        if (data) {
          const {
            eventName,
            location,
            announcements,
            selectNum,
            startTime,
            endTime,
            photoUrls,
            photoDescs,
          } = data;

          if (photoUrls) hasEventPhoto = true;

          eventInfo.eventName = eventName;
          eventInfo.location = location;
          eventInfo.announcements = announcements;
          eventInfo.selectNum = selectNum;
          eventInfo.startTime = startTime;
          eventInfo.endTime = endTime;

          if (photoUrls && photoUrls.length !== 0) {
            eventInfo.images = photoUrls.map((photoUrl, index) => ({
              url: photoUrl,
              desc: photoDescs[index],
              isEditing:false
            }));
          }
          editable.value = false;
        } else {
          console.error("Invalid API response:", data);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    const deletePhoto = (idx) => {
      eventInfo.images.splice(idx, 1)
    }

    onMounted(() => {
      inputFile.value = document.getElementById("inputFile");
      getEventData();
    });

    return {
      editable,
      numOfParticipants,
      VueDatePicker,
      inputFile,
      images,
      handleImageUpload,
      eventInfo,
      updateFieldValue,
      applyEventInfo,
      getEventData,
      handleDelayedPhotoDesc,
      handlePhotoDesc,
      deletePhoto
    };
  },
};
</script>

<style scoped>
.imgTextArea {
  height: 100%;
}
.box-container {
  margin-bottom: 30px;
}
.setting-left-area {
  width: 1000px;
}
.eidt-area {
  margin-top: 100px;
}

.numberSelect {
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
  /* height: 543px, hard code now shoub be fixed */
  height: 543px;
  padding: 10px;
  border: 1px solid #80808045;
  margin-top: 20px;
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
  width:100px;
  display: flex;
  justify-content:center
}


input[type="file"] {
  display: none;
}
.textArea {
  width: 400px;
  resize: none;
}

.dp__disabled {
  background: white !important;
}

.line {
  border-top: 1px solid #8080803d;
}

.dp__input_wrap input {
  background: white !important;
}
</style>
