<script setup lang="ts">
import {onMounted, ref} from "vue";
import axios from "axios";
const tableData = ref([])
const testPost =() =>{
  axios.post('http://localhost:8090/user/saveOrMod', {
    "id": 39,
    "no": "aute irure ex",
    "name": "藩安琪",
    "password": "2qfc2jFwzB7uysR",
    "age": 51,
    "sex": 31,
    "phone": "095 4725 0521",
    "roleId": 92,
    "isValid": "18"
  })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
}
onMounted(() => {
  axios.get('http://localhost:8090/user/list', {

  })
      .then(function (response) {
        console.log(response);
        tableData.value=response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
});

</script>

<template>
  <el-scrollbar>
    <el-button @click="testPost">测试post</el-button>
    <el-table :data="tableData">
      <el-table-column prop="date" label="Date" width="140" />
      <el-table-column prop="name" label="Name" width="120" />
      <el-table-column prop="address" label="Address" />
    </el-table>
  </el-scrollbar>
</template>

<style scoped>

</style>