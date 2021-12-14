<template>
  <div class="hotel">
    <div class="d-flex pa-2">
      <div class="top-wrapper">
        <dl>
          <dt class="text-center">
            <div class="text-subtitle font-weight-black">行き先</div>
          </dt>
          <dd class="pl-8">
            <v-select
              id="prefecture"
              @change="changeMiddleArea"
              v-model="selectMiddleClassName"
              :items="showMiddleClassName"
              label="都道府県"
            >
              <option v-for="(middleClass, i) of showMiddleClassName" :key="i">
                {{ middleClass }}
              </option>
            </v-select>
          </dd>
          <dd class="pl-8">
            <v-select
              id="area"
              v-model="selectSmallClassName"
              @change="changeSmallArea"
              :items="showSmallClassName"
              label="市区町村"
            >
              <option
                v-for="smallClass of showSmallClassName"
                :key="smallClass"
                class="text-left"
              >
                {{ smallClass }}
              </option>
            </v-select>
          </dd>
          <dd class="pl-8">
            <v-select
              id="detail-area"
              v-model="selectDetailClassName"
              @change="changeSmallArea"
              :items="showDetailClassName"
              label="地域名"
            >
              <option
                v-for="detailClass of showDetailClassName"
                :key="detailClass"
                class="text-left"
              >
                {{ detailClass }}
              </option>
            </v-select>
          </dd>
          <dt class="text-center">
            <div class="text-subtitle font-weight-black">宿泊日程</div>
          </dt>
          <dd class="pl-4">
            <v-date-picker v-model="dates" range></v-date-picker>
          </dd>
          <dd class="pl-4 mt-4">
            <v-text-field
              v-model="dateRangeText"
              label="選択された日程"
              prepend-icon="mdi-calendar"
              readonly
            ></v-text-field>
          </dd>
          <dt class="text-center">
            <div class="text-subtitle font-weight-black">人数</div>
          </dt>
          <dd class="pl-8">
            <v-select
              v-model="adultNum"
              id="adultNum"
              :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </v-select>
          </dd>
        </dl>
        <v-row class="justify-center ma-4">
          <v-btn type="button" @click="search" color="primary"
            >検索</v-btn
          ></v-row
        >
      </div>
      <div class="container">
        <div>
          {{ errorMessage }}
        </div>
        <div v-show="haveShowHotel">
          <v-row align="center" class="d-flex justify-end">
            <span class="text-subtitle">並び順</span>
            <v-col cols="2">
              <v-select
                name="sort"
                id="sort"
                @change="sortChange"
                :items="sortItems"
                v-model="sort"
                width="10"
              >
                <option v-for="sortItem of this.sortItems" :key="sortItem">
                  {{ sortItem }}
                </option>
              </v-select>
            </v-col>
          </v-row>
        </div>
        <ul>
          <li>
            <v-card
              v-for="(showHotel, i) of showHotels"
              :key="i"
              class="mb-4 pa-4"
              outlined
            >
              <div class="d-flex">
                <img :src="showHotel.hotelImageUrl" alt="ホテルイメージ" />
                <div class="ml-2">
                  <p class="hotel-name">{{ showHotel.hotelName }}</p>
                  <p>{{ showHotel.hotelSpecial }}</p>
                  <v-row align="center" class="mx-0">
                    お客様の声 {{ showHotel.reviewCount }}件
                    <v-rating
                      background-color="orange lighten-3"
                      color="orange"
                      size="20"
                      v-model="showHotel.reviewAverage"
                      half-increments="true"
                      readonly="true"
                    ></v-rating>
                    {{ showHotel.reviewAverage }}
                  </v-row>
                  <div class="my-4">
                    <span>
                      最安料金{{
                        showHotel.hotelMinCharge.toLocaleString()
                      }}円</span
                    >
                    &nbsp;&nbsp;
                    <span
                      >(消費税込み{{
                        Math.floor(
                          showHotel.hotelMinCharge * 1.1
                        ).toLocaleString()
                      }}円)</span
                    >
                  </div>
                </div>
              </div>

              <div class="mt-2">
                〒{{ showHotel.postalCode }}&nbsp;
                {{ showHotel.address1 + showHotel.address2 }}
              </div>

              <div class="mt-2">アクセス：{{ showHotel.access }}</div>

              <div class="mt-2">
                駐車場&nbsp;&nbsp;&nbsp;&nbsp;：{{
                  showHotel.parkingInformation
                }}
              </div>
              <template>
                <v-dialog v-model="dialog">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="primary"
                      dark
                      v-bind="attrs"
                      v-on="on"
                      class="ma-2"
                    >
                      地図を表示
                    </v-btn>
                  </template>
                  <v-card max-width="600" class="mx-auto"
                    ><iframe
                      :src="mapUrl[i]"
                      frameborder="0"
                      scrolling="no"
                      marginheight="0"
                      marginwidth="0"
                      width="600"
                      height="450"
                    ></iframe
                  ></v-card>
                </v-dialog>
              </template>
            </v-card>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
@Component
export default class Hotel extends Vue {
  // APIから取得した日本国内の地区全データ
  private largeClasses: any = [];
  // 表示用都道府県名
  private showMiddleClassName: any = [];
  // 都道府県コードの配列
  private showMiddleClassCode: any = [];
  // JSONデータ格納用市区町村
  private currentSmallClasses: any = [];
  // 表示用市区町村名
  private showSmallClassName: any = [];
  // 市区町村コードの配列
  private showSmallClassCode: any = [];
  // 表示用地域名
  private showDetailClassName: any = [];
  // 地域コードの配列
  private showDetailClassCode: any = [];
  // 選択された都道府県
  private selectMiddleClassName = "";
  // 選択された市区町村
  private selectSmallClassName = "";
  // 選択された地域
  private selectDetailClassName = "";
  // APIに送る都道府県コード
  private middleAreaCode = "";
  // APIに送る市区町村コード
  private smallAreaCode = "";
  // APIに送る地域コード
  private detailAreaCode = "";
  // チェックイン/チェックアウトの日程
  private dates = [];
  // 選択された都道府県のインデックス
  private areaIndex = 0;
  // 選択された市区町村のインデックス
  private smallAreaIndex = 0;
  // 選択された地域名のインデックス
  private detailAreaIndex = 0;
  // 宿泊人数
  private adultNum = 0;
  // 並び替え後のホテル一覧
  private showHotels: any = [];
  // 仮に入れるホテル一覧
  private currentHotels: any = [];
  // mapURL
  private mapUrl: Array<string> = [];
  // 並び替え選択肢
  private sortItems = ["おすすめ順", "価格が高い順", "価格が安い順"];
  //選択された並び替え順
  private sort = "おすすめ順";
  // 並び替え表示判定
  private haveShowHotel = false;

  async created(): Promise<void> {
    await this.$store.dispatch("getAreas");
    this.showMiddleClassName = this.$store.getters.getMiddleClassName;
    this.showMiddleClassCode = this.$store.getters.getMiddleClassCode;
    this.currentSmallClasses = this.$store.getters.getCurrentSmallClasses;
  }
  /**
   * 都道府県が選択された時に、対応する地域を取得し選択可能にする.
   */
  changeMiddleArea(): void {
    this.showSmallClassName = [];
    this.showSmallClassCode = [];
    // 都道府県のindexと一致する地域を取り出して格納
    let index = 0;
    for (var confirm of this.showMiddleClassName) {
      if (confirm === this.selectMiddleClassName) {
        break;
      }
      index++;
    }
    // コード抽出用インデックス
    this.areaIndex = index;
    let smallClassList = [];
    for (
      let i = 0;
      i < this.currentSmallClasses[index].smallClasses.length;
      i++
    ) {
      smallClassList.push(this.currentSmallClasses[index].smallClasses[i]);
    }
    const count = this.currentSmallClasses[index].smallClasses.length;
    for (let i = 0; i < count; i++) {
      this.showSmallClassName.push(
        smallClassList[i].smallClass[0].smallClassName
      );
      this.showSmallClassCode.push(
        smallClassList[i].smallClass[0].smallClassCode
      );
    }
  }
  /**
   * 選択された市区町村のインデックスを取得する.
   */
  changeSmallArea(): void {
    let index = 0;
    for (var confirm of this.showSmallClassName) {
      if (confirm === this.selectSmallClassName) {
        break;
      }
      index++;
    }
    // コード抽出用インデックス
    this.smallAreaIndex = index;

    // detailClass
    // 初期化
    this.showDetailClassName = [];
    this.showDetailClassCode = [];
    let detailClasses = [];
    let detailClass = [];
    detailClasses.push(this.currentSmallClasses[this.areaIndex]);
    detailClass.push(detailClasses[0]);
    for (let currentDetailClass of detailClass[0].smallClasses[
      this.smallAreaIndex
    ].smallClass[1].detailClasses) {
      this.showDetailClassName.push(
        currentDetailClass.detailClass.detailClassName
      );
      this.showDetailClassCode.push(
        currentDetailClass.detailClass.detailClassCode
      );
    }
  }
  /**
   * 選択された地域のインデックスを取得する.
   */
  changeDetailArea(): void {
    let index = 0;
    for (let confirm of this.showDetailClassName) {
      if (confirm === this.selectDetailClassName) {
        break;
      }
      index++;
    }
    // コード抽出用インデックス
    this.detailAreaIndex = index;
  }
  /**
   * 選択された日程を表示する.
   * @returns チェックイン〜チェックアウトの日程
   */
  get dateRangeText(): string {
    return this.dates.join(" ~ ");
  }
  /**
   * 検索ボタンを押すとAPIにデータを送り、条件を満たした予約可能なホテルを取得する.
   */
  async search(): Promise<void> {
    this.middleAreaCode = this.showMiddleClassCode[this.areaIndex];
    this.smallAreaCode = this.showSmallClassCode[this.smallAreaIndex];
    this.detailAreaCode = this.showDetailClassCode[this.detailAreaIndex];
    // 初期化
    this.showHotels = [];
    this.currentHotels = [];

    let response: any;
    if (this.selectDetailClassName === "") {
      response = await axios.get(
        `https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426?format=json&checkinDate=${this.dates[0]}&checkoutDate=${this.dates[1]}&largeClassCode=japan&middleClassCode=${this.middleAreaCode}&smallClassCode=${this.smallAreaCode}&adultNum=${this.adultNum}&applicationId=1056284386475499310`
      );
    } else {
      response = await axios.get(
        `https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426?format=json&checkinDate=${this.dates[0]}&checkoutDate=${this.dates[1]}&largeClassCode=japan&middleClassCode=${this.middleAreaCode}&smallClassCode=${this.smallAreaCode}&detailClassCode=${this.detailAreaCode}&adultNum=${this.adultNum}&applicationId=1056284386475499310`
      );
    }

    for (let hotel of response.data.hotels) {
      this.currentHotels.push(hotel.hotel);
    }
    this.startDisplay();
    if (this.currentHotels) {
      this.haveShowHotel = true;
    }
  }
  /**
   * ホテル名でgoogleMap上の位置情報を取得
   */
  getMapUrl(): void {
    this.mapUrl = [];
    for (let i = 0; i < this.showHotels.length; i++) {
      this.mapUrl.push(
        `https://maps.google.co.jp/maps?q=${this.showHotels[i].hotelName}&output=embed&t=m&z=16&hl=ja`
      );
    }
  }

  /**
   * 初期表示(ホテル一覧をおすすめ順で表示させる).
   */
  startDisplay(): void {
    for (let i = 0; i < this.currentHotels.length; i++) {
      this.showHotels.push(this.currentHotels[i][0].hotelBasicInfo);
    }
    this.selectDetailClassName = "";
    this.getMapUrl();
  }

  /**
   * 並び替え.
   */
  sortChange(): void {
    // おすすめ順
    if (this.sort === "おすすめ順") {
      this.showHotels = [];
      this.startDisplay();
      //安い順
    } else if (this.sort === "価格が安い順") {
      this.showHotels.sort(function (before: any, after: any) {
        if (after.hotelMinCharge > before.hotelMinCharge) {
          return -1;
        } else {
          return 1;
        }
      });
      this.getMapUrl();
      // 高い順
    } else if (this.sort === "価格が高い順") {
      this.showHotels.sort(function (before: any, after: any) {
        if (after.hotelMinCharge > before.hotelMinCharge) {
          return 1;
        } else {
          return -1;
        }
      });
      this.getMapUrl();
    }
  }
}
</script>

<style scoped>
img {
  width: 300px;
  height: 169px;
  object-fit: cover; /* 画像の横縦比を固定したまま切り取る！ */
}
dt {
  margin: 5px 0px;
}
.hotel-name {
  font-weight: bold;
  font-size: 20px;
}
ul {
  list-style: none;
}
</style>
