// src/component/Login.vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { User, Lock } from '@element-plus/icons-vue'
const router = useRouter()

// 表单数据
const loginForm = ref({
  username: 'test003',
  password: '123456'
})

// 表单验证规则 (保留定义，但不再被 handleLogin 调用)
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'change'] },
    { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'change'] },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ]
}

// 登录表单引用
const loginFormRef = ref()

// 处理登录
const login =() =>{
  api.post('/user/login', {
    "no": loginForm.value.username,
    "password": loginForm.value.password

  })
      .then(function (response) {
        console.log(response);
        if (response.data.code == 200){
          ElMessage({
            type: 'success',
            message: '登录成功!',
          });
          router.push('/home/info')
        }else if (response.data.data=="用户名或密码错误"){
          {
            ElMessage({
              type: 'error',
              message: '用户名或者密码错误!',
            });
          }
        }


      })
      .catch(function (error) {
        console.log(error);
        ElMessage({
          type: 'error',
          message: '登陆失败!',
        });
      });
}

// 重置表单
const resetForm = () => {
  loginForm.value = {
    username: '',
    password: ''
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-title">仓库管理系统</div>

      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter="login"
      >
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              class="login-button"
              @click="login"
          >
            登录
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-box {
  width: 400px;
  padding: 30px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
}

.login-form {
  padding: 20px 0;
}

.login-button {
  width: 100%;
  margin-bottom: 15px;
}
</style>