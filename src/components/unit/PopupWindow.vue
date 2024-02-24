<template>
  <teleport to="body">
    <div class="popup-background"  @click="hidePopup"></div>
  </teleport>
  <teleport to="body">
    <div class="popup-window">
      <div class="popup-content">
        <slot name="detail"></slot>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.popup-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999; 
}

.popup-content {
  /* Add styling for your popup content */
}
.popup-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  z-index: 1000;
}

.popup-content {
  width:800px;
}
</style>
