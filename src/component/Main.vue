<script setup lang="ts">
import {Search} from '@element-plus/icons-vue'

import {onMounted, ref,reactive} from "vue";
import api from "@/api.ts";
const tableData = ref([])
import type { ComponentSize } from 'element-plus'
import { ElMessage ,ElMessageBox} from 'element-plus'
const name = ref()
const sexs = ref([{value:1,label:'男'},{value:0,label:'女'}])
const sex = ref()
const currentPage4 = ref(1)
const phone = ref()
const total = ref(100)
const pageSize4 = ref(10)
const size = ref<ComponentSize>('default')
const background = ref(false)
const disabled = ref(false)
const reset = () => {
  name.value = null
  sex.value = null
  testPost();
}
const addFormRef = ref()
const editFormRef = ref()
const dialogTableVisible = ref(false)
const dialogFormVisible = ref(false)
const formLabelWidth = '130px'

// 添加删除功能
const deleteUser = (row: any) => {
  ElMessageBox.confirm(
      `确定要删除用户 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    // 调用删除API
    api.delete(`/user/delete/${row.id}`)
        .then(function (response) {
          if (response.data.code == 200) {
            // 删除成功后重新加载数据
            testPost();
            ElMessage({
              type: 'success',
              message: '删除成功!',
            });
          } else {
            ElMessage({
              type: 'error',
              message: '删除失败!',
            });
          }
        })
        .catch(function (error) {
          console.log(error);
          ElMessage({
            type: 'error',
            message: '删除失败!',
          });
        });
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除',
    });
  });
}

const form = reactive({
  no: '',
  name: '',
  password: '',
  age: '',
  sex: '',
  phone: '',
  roleId: '',
})
const editForm = reactive({
  id: '',
  no: '',
  name: '',
  password: '',
  age: '',
  sex: '',
  phone: '',
  roleId: '',
})
const dialogEditVisible = ref(false)

// 编辑用户
const editUser = (row: any) => {
  // 将选中行的数据填充到编辑表单
  Object.assign(editForm, row)
  dialogEditVisible.value = true
}

// 确认修改
const confirmEdit = () => {
  api.post('/user/Mod', {
    id: editForm.id,
    no: editForm.no,
    name: editForm.name,
    password: editForm.password,
    age: Number(editForm.age),
    sex: editForm.sex,
    phone: editForm.phone,
    roleId: editForm.roleId
  })
      .then(function (response) {
        console.log(response);
        if (response.data === true) {
          testPost(); // 重新加载数据
          dialogEditVisible.value = false;
          ElMessage({
            message: '用户修改成功！',
            type: 'success',
            duration: 3000
          });
        }
      })
      .catch(function (error) {
        console.log(error);
        ElMessage({
          message: '用户修改失败！',
          type: 'error',
          duration: 3000
        });
      });
}
const restForm = () => {
  Object.assign(form, {
    no: '',
    name: '',
    password: '',
    age: '',
    sex: '',
    phone: '',
    roleId: '',
  })
}

const confirmAdd = () => {
  api.post('/user/save', {
    no: form.no,
    name: form.name,
    password: form.password,
    age: Number(form.age),
    sex: form.sex,
    phone: form.phone,
    roleId: form.roleId
  })
      .then(function (response) {
        console.log(response);
        if (response.data.data == true) {
          testPost();
          // 显示成功消息
          ElMessage({
            message: '用户添加成功！',
            type: 'success',
            duration: 3000 // 3秒后自动关闭
          });

          // 3秒后关闭对话框
          setTimeout(() => {
            dialogFormVisible.value = false;
            restForm();
          }, 3000);
        }
      })
      .catch(function (error) {
        console.log(error);
        ElMessage({
          message: '用户添加失败！',
          type: 'error',
          duration: 3000 // 3秒后自动关闭
        });
      });
}
const add = () => {
  dialogFormVisible.value = true

}
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
  currentPage4.value=1
  pageSize4.value = val
  testPost();
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
  currentPage4.value = val
  testPost();
}
const testPost =() =>{
  api.post('/user/listPageC', {
    "pageNum": currentPage4.value,
    "pageSize": pageSize4.value,
    params:{
        name:name.value,
        sex:sex.value
    }

  })
      .then(function (response) {
        console.log(response);
        if (response.data.code == 200){
          tableData.value = response.data.data;
          total.value = response.data.total;
        }


      })
      .catch(function (error) {
        console.log(error);
      });
}
onMounted(() => {
  testPost();
});
const formRules = {
  no: [
    { required: true, message: '账号不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度必须在3-20个字符之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '姓名不能为空', trigger: 'blur' },
    { max: 50, message: '姓名长度不能超过50个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ],
  age: [
    { type: 'number', min: 0, max: 150, message: '年龄必须在0-150之间', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '性别不能为空', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '角色不能为空', trigger: 'change' }
  ]
}
</script>

<template>
  <el-scrollbar>
    <div style="margin-bottom: 5px">
      <el-input  v-model="name" placeholder="请输入内容" size="default" style="width: 200px" @keyup.enter="testPost" >
        <template #suffix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="sex" placeholder="请选择性别" style="width: 200px;margin-left: 5px">
        <el-option
            v-for="item in sexs"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <el-button type="success" style="margin-left: 5px" @click="testPost">搜索</el-button>
      <el-button type="danger"@click="reset">重置</el-button>
      <el-button type="primary" @click="add">新增</el-button>

    </div>
    <el-table :data="tableData" :header-cell-style="{background:'#f5f5f5'}" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="no" label="账号" width="180" />
      <el-table-column prop="name" label="Name" width="120" />
      <el-table-column prop="age" label="年龄" width="80" />
      <el-table-column prop="sex" label="性别" width="80" >
        <template #default="scope">
          <el-tag v-if="scope.row.sex==1">男</el-tag>
          <el-tag v-else>女</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="roleId" label="角色" width="120" >
        <template #default="scope">
          <el-tag v-if="scope.row.roleId==0">超级管理员</el-tag>
          <el-tag v-else-if="scope.row.roleId==1">管理员</el-tag>
          <el-tag v-else>普通用户</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="phone" label="电话" width="180" />
      <el-table-column prop="operate" label="操作"  >
        <template #default="scope">
          <el-button type="primary" size="default" @click="editUser(scope.row)">修改</el-button>
          <el-button type="danger" size="default" @click="deleteUser(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="demo-pagination-block">
      <div class="demonstration">分页查询</div>
      <el-pagination
          v-model:current-page="currentPage4"
          v-model:page-size="pageSize4"
          :page-sizes="[2, 5, 10, 20]"
          :size="size"
          :disabled="disabled"
          :background="background"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </el-scrollbar>
  <el-dialog v-model="dialogFormVisible"  rules="formRules" title="新增用户" width="500" @close="restForm">
    <el-form :model="form">
      <el-form-item label="账号" :label-width="formLabelWidth"  class="short-input">
        <el-input v-model="form.no"  autocomplete="off" />
      </el-form-item>
      <el-form-item label="姓名" :label-width="formLabelWidth" class="short-input">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="密码" :label-width="formLabelWidth" class="short-input">
        <el-input v-model="form.password" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="年龄" :label-width="formLabelWidth" class="short-input">
        <el-input v-model="form.age" type="number" />
      </el-form-item>
      <el-form-item label="性别" :label-width="formLabelWidth" class="short-input">
        <el-select v-model="form.sex" placeholder="请选择性别">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="电话" :label-width="formLabelWidth" class="short-input">
        <el-input v-model="form.phone" autocomplete="off" />
      </el-form-item>
      <el-form-item label="角色" :label-width="formLabelWidth" class="short-input">
        <el-select v-model="form.roleId" placeholder="请选择角色">
          <el-option label="管理员" :value="1" />
          <el-option label="普通用户" :value="2" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false;restForm()" >取消</el-button>
        <el-button type="primary" @click="confirmAdd">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogEditVisible"  :rules="formRules" title="编辑用户" width="500">
    <el-form :model="editForm">
      <el-form-item label="账号" :label-width="formLabelWidth" class="short-input">
        <el-input v-model="editForm.no" autocomplete="off" />
      </el-form-item>
      <el-form-item label="姓名" :label-width="formLabelWidth" class="short-input">
        <el-input v-model="editForm.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="密码" :label-width="formLabelWidth" class="short-input">
        <el-input v-model="editForm.password" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="年龄" :label-width="formLabelWidth" class="short-input">
        <el-input v-model="editForm.age" type="number" />
      </el-form-item>
      <el-form-item label="性别" :label-width="formLabelWidth" class="short-input">
        <el-select v-model="editForm.sex" placeholder="请选择性别">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="电话" :label-width="formLabelWidth" class="short-input">
        <el-input v-model="editForm.phone" autocomplete="off" />
      </el-form-item>
      <el-form-item label="角色" :label-width="formLabelWidth" class="short-input">
        <el-select v-model="editForm.roleId" placeholder="请选择角色">
          <el-option label="管理员" :value="1" />
          <el-option label="普通用户" :value="2" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogEditVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.demo-pagination-block + .demo-pagination-block {
  margin-top: 10px;
}
.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}
.short-input {
  width: 80% !important;
}
</style>