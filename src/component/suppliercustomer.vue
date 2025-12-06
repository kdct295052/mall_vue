<!-- SupplierCustomer.vue (Vue 3 + Element Plus) -->
<template>
  <div class="supplier-customer-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>供应商/客户管理</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button type="success" @click="onAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="partyID" label="ID" width="80" />
        <el-table-column prop="name" label="公司/个人名称" />
        <el-table-column prop="type" label="类型">
          <template #default="scope">
            {{ formatType(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="contactName" label="联系人" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="pagination"
      />

    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="40%">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="供应商" value="Supplier" />
            <el-option label="客户" value="Customer" />
            <el-option label="两者都是" value="Both" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="form.contactName" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据定义
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单引用
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 表单数据
const form = reactive({
  partyID: null,
  name: '',
  type: '',
  contactName: '',
  phone: '',
  address: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ]
}

// 获取数据
const fetchData = async () => {
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      params: {}
    }

    if (searchForm.name) {
      params.params.name = searchForm.name
    }
    axios.defaults.baseURL = 'http://localhost:8090'
    const response = await axios.post('/suppliercustomer/listPage', params)
    tableData.value = response.data.data
    total.value = response.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取数据失败')
  }
}

// 搜索
const onSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 新增
const onAdd = () => {
  dialogTitle.value = '新增供应商/客户'
  isEdit.value = false
  Object.assign(form, {
    partyID: null,
    name: '',
    type: '',
    contactName: '',
    phone: '',
    address: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (index, row) => {
  dialogTitle.value = '编辑供应商/客户'
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const url = isEdit.value
          ? '/suppliercustomer/update'
          : '/suppliercustomer/save'

        const response = await axios.post(url, form)

        if (response.data.code === "200") {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          fetchData()
        } else {
          ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      }
    }
  })
}

// 删除
const handleDelete = (index, row) => {
  ElMessageBox.confirm('确定要删除该记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.post('/suppliercustomer/delete', { partyID: row.partyID })

      if (response.data.code === "200") {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error('删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 格式化类型显示
const formatType = (type) => {
  switch (type) {
    case 'Supplier': return '供应商'
    case 'Customer': return '客户'
    case 'Both': return '两者都是'
    default: return type
  }
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchData()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.supplier-customer-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
