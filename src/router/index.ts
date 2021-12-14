import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import MainPage from "../views/MainPage.vue";
import Hotel from "../views/Hotel.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    component: MainPage,
  },
  {
    path: "/Hotel",
    component: Hotel,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
