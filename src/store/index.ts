import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  state: {
    currentLargeClasses: new Array<any>(),
    currentMiddleClasses: new Array<any>(),
    currentSmallClasses: new Array<any>(),
    showMiddleClassName: new Array<any>(),
    showMiddleClassCode: new Array<any>(),
  },
  actions: {
    async getAreas(context) {
      const response = await axios.get(
        "https://app.rakuten.co.jp/services/api/Travel/GetAreaClass/20131024?format=json&applicationId=1056284386475499310"
      );
      const payload = response.data.areaClasses.largeClasses[0].largeClass;
      context.commit("getAreas", payload);
    },
  },
  mutations: {
    getAreas(state, payload) {
      // middleClass
      // console.dir(payload[1].middleClasses);
      for (const currentMiddleClass of payload[1].middleClasses) {
        state.currentMiddleClasses.push(currentMiddleClass.middleClass);
      }
      for (let i = 0; i < state.currentMiddleClasses.length; i++) {
        state.showMiddleClassName.push(
          state.currentMiddleClasses[i][0].middleClassName
        );
        state.showMiddleClassCode.push(
          state.currentMiddleClasses[i][0].middleClassCode
        );
      }
      // smallClass
      for (const currentSmallClass of payload[1].middleClasses) {
        state.currentSmallClasses.push(currentSmallClass.middleClass[1]);
      }
    },
  },
  modules: {},
  getters: {
    /**
     * @param state - ステート
     * @returns - 都道府県一覧
     */
    getMiddleClassName(state) {
      return state.showMiddleClassName;
    },
    /**
     * @param state - ステート
     * @returns - 都道府県コード一覧
     */
    getMiddleClassCode(state) {
      return state.showMiddleClassCode;
    },
    /**
     *
     * @param state - ステート
     * @returns - 市区町村一覧
     */
    getCurrentSmallClasses(state) {
      return state.currentSmallClasses;
    },
  },
});
