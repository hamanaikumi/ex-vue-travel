<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <div class="ml-4">
          <v-btn to="/" text>
            <span>TOP</span>&nbsp; <v-icon>mdi-home</v-icon></v-btn
          >
        </div>
        <div class="ml-4">
          <v-btn to="/Hotel" text>
            <span>ホテル検索</span>&nbsp; <v-icon>mdi-airplane</v-icon></v-btn
          >
        </div>
      </div>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",

  data: () => ({
    //
  }),
});
</script>
