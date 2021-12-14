<template>
  <div></div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "task",
  props: {
    task: {
      type: Object, //データ型
      required: true, //データ渡し必須
    },
    favorite: {
      type: Boolean,
      required: true,
    },
    check: {
      type: Boolean,
      required: true,
    },
  },
});
</script>

<style></style>
