<!-- src/component/StockIn.vue -->
<template>
  <div class="stock-in-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>入库管理</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" :icon="Plus" @click="handleAdd">新增入库单</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderNo" label="入库单号" width="180" />
        <el-table-column prop="typeName" label="入库类型" width="120" />
        <el-table-column prop="supplierName" label="供应商" width="150" />
        <el-table-column prop="warehouseName" label="仓库" width="150" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetails(scope.row)">详情</el-button>
            <el-button
              v-if="scope.row.status === 1"
              type="primary"
              size="small"
              @click="approveStockIn(scope.row.id)"
            >
              审核
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="stockInFormRef"
        :model="stockInForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入库类型" prop="type">
              <el-select v-model="stockInForm.type" placeholder="请选择入库类型">
                <el-option label="采购入库" :value="1" />
                <el-option label="退货入库" :value="2" />
                <el-option label="调拨入库" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplierId">
              <el-select v-model="stockInForm.supplierId" placeholder="请选择供应商" filterable>
                <el-option
                  v-for="supplier in suppliers"
                  :key="supplier.partyID"
                  :label="supplier.name"
                  :value="supplier.partyID"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仓库" prop="warehouseId">
              <el-select v-model="stockInForm.warehouseId" placeholder="请选择仓库" filterable>
                <el-option
                  v-for="warehouse in warehouses"
                  :key="warehouse.warehouseID"
                  :label="warehouse.name"
                  :value="warehouse.warehouseID"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="stockInForm.remark" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 明细表格 -->
        <el-divider content-position="left">入库明细</el-divider>
        <el-table :data="stockInForm.details" border>
          <el-table-column label="货品">
            <template #default="scope">
              <el-select
                v-model="scope.row.itemId"
                placeholder="请选择货品"
                filterable
                @change="handleItemChange(scope.$index)"
              >
                <el-option
                  v-for="item in items"
                  :key="item.itemId"
                  :label="`${item.name} (${item.itemCode})`"
                  :value="item.itemId"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="120">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="1"
                @change="calculateAmount(scope.$index)"
              />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.price"
                :min="0"
                :precision="2"
                @change="calculateAmount(scope.$index)"
              />
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120">
            <template #default="scope">
              ¥{{ (scope.row.quantity * scope.row.price).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="备注" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.remark" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="removeDetail(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 10px;">
          <el-button type="primary" @click="addDetail">添加明细</el-button>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="入库单详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="入库单号">{{ currentStockIn.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="入库类型">{{ getTypeText(currentStockIn.type) }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentStockIn.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ currentStockIn.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ currentStockIn.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ getStatusText(currentStockIn.status) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentStockIn.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentStockIn.remark }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">入库明细</el-divider>
      <el-table :data="currentStockInDetails" border>
        <el-table-column prop="itemName" label="货品名称" />
        <el-table-column prop="itemCode" label="货品编码" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="price" label="单价">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额">
          <template #default="scope">
            ¥{{ scope.row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

// 类型定义
interface StockIn {
  id?: number
  orderNo?: string
  type: number | null
  supplierId: number | null
  warehouseId: number | null
  status?: number
  totalAmount?: number
  remark: string
  createTime?: string
  typeName?: string
  supplierName?: string
  warehouseName?: string
  statusName?: string
}

interface StockInDetail {
  itemId: number | null
  quantity: number
  price: number
  amount?: number
  remark: string
  itemName?: string
  itemCode?: string
}

interface Supplier {
  partyID: number
  name: string
}

interface Warehouse {
  warehouseID: number
  name: string
}

interface Item {
  itemId: number
  name: string
  itemCode: string
  purchasePrice?: number
}

// 响应式数据
const tableData = ref<StockIn[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const dialogTitle = ref('')
const stockInFormRef = ref()

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  status: null as number | null
})

// 入库单表单
const stockInForm = reactive({
  type: null as number | null,
  supplierId: null as number | null,
  warehouseId: null as number | null,
  remark: '',
  details: [] as StockInDetail[]
})

// 当前查看的入库单
const currentStockIn = ref<StockIn>({} as StockIn)
const currentStockInDetails = ref<StockInDetail[]>([])

// 下拉选项数据
const suppliers = ref<Supplier[]>([])
const warehouses = ref<Warehouse[]>([])
const items = ref<Item[]>([])

// 表单验证规则
const formRules = {
  type: [
    { required: true, message: '请选择入库类型', trigger: 'change' }
  ],
  supplierId: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ],
  warehouseId: [
    { required: true, message: '请选择仓库', trigger: 'change' }
  ]
}


const fetchData = async () => {
  loading.value = true
  try {
    // 确保基础数据先加载
    if (suppliers.value.length === 0 || warehouses.value.length === 0) {
      await fetchOptions()
    }

    const params = {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      params: {
        orderNo: searchForm.orderNo || null,
        status: searchForm.status
      }
    }

    const response = await api.post('/stock/in/listPage', params)
    if (response.data.code == 200) {
      tableData.value = response.data.data.map((item: any) => {
        // 查找供应商名称
        const supplier = suppliers.value.find(s => s.partyID === item.supplierId)
        // 查找仓库名称
        const warehouse = warehouses.value.find(w => w.warehouseID === item.warehouseId)

        return {
          ...item,
          typeName: getTypeText(item.type),
          statusName: getStatusText(item.status),
          supplierName: supplier ? supplier.name : '',
          warehouseName: warehouse ? warehouse.name : ''
        }
      })
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.data.message || '获取入库单列表失败')
    }
  } catch (error) {
    console.error('获取入库单列表失败:', error)
    ElMessage.error('获取入库单列表失败')
  } finally {
    loading.value = false
  }
}



// 获取下拉选项数据
const fetchOptions = async () => {
  try {
    // 获取供应商列表
    const supplierRes = await api.get('/suppliercustomer/list')
    if (supplierRes.data.code == 200) {
      suppliers.value = supplierRes.data.data.filter((item: any) =>
        item.type === 'Supplier' || item.type === 'Both'
      )
    }

    // 获取仓库列表
    const warehouseRes = await api.get('/warehouse/list')
    if (warehouseRes.data.code == 200) {
      warehouses.value = warehouseRes.data.data
    }

    // 获取货品列表
    const itemRes = await api.get('/item/list')
    if (itemRes.data.code == 200) {
      items.value = itemRes.data.data
    }
  } catch (error) {
    console.error('获取下拉选项失败:', error)
    ElMessage.error('获取下拉选项失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.status = null
  handleSearch()
}

// 新增入库单
const handleAdd = () => {
  dialogTitle.value = '新增入库单'
  resetForm()
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  stockInForm.type = null
  stockInForm.supplierId = null
  stockInForm.warehouseId = null
  stockInForm.remark = ''
  stockInForm.details = [{
    itemId: null,
    quantity: 1,
    price: 0,
    remark: ''
  }]
}

// 添加明细行
const addDetail = () => {
  stockInForm.details.push({
    itemId: null,
    quantity: 1,
    price: 0,
    remark: ''
  })
}

// 删除明细行
const removeDetail = (index: number) => {
  if (stockInForm.details.length <= 1) {
    ElMessage.warning('至少保留一条明细')
    return
  }
  stockInForm.details.splice(index, 1)
}

// 货品变更时自动填充单价
const handleItemChange = (index: number) => {
  const detail = stockInForm.details[index]
  if (detail && detail.itemId) {
    const item = items.value.find(i => i.itemId === detail.itemId)
    if (item && item.purchasePrice) {
      detail.price = item.purchasePrice
      calculateAmount(index)
    }
  }
}

// 计算金额
const calculateAmount = (index: number) => {
  const detail = stockInForm.details[index]
  if (detail) {
    detail.amount = parseFloat((detail.quantity * detail.price).toFixed(2))
  }
}

// 提交表单
const submitForm = () => {
  if (!stockInFormRef.value) return

  stockInFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 验证明细
      if (stockInForm.details.length === 0) {
        ElMessage.error('请添加至少一条明细')
        return
      }

      for (const detail of stockInForm.details) {
        if (!detail.itemId) {
          ElMessage.error('请选择货品')
          return
        }
        if (detail.quantity <= 0) {
          ElMessage.error('数量必须大于0')
          return
        }
        if (detail.price < 0) {
          ElMessage.error('单价不能为负数')
          return
        }
      }

      try {
        const requestData = {
          type: stockInForm.type,
          supplierId: stockInForm.supplierId,
          warehouseId: stockInForm.warehouseId,
          remark: stockInForm.remark,
          details: stockInForm.details
        }

        const response = await api.post('/stock/in/add', requestData)
        if (response.data.code == 200) {
          ElMessage.success('新增入库单成功')
          dialogVisible.value = false
          fetchData()
        } else {
          ElMessage.error(response.data.message || '新增入库单失败')
        }
      } catch (error) {
        console.error('新增入库单失败:', error)
        ElMessage.error('新增入库单失败')
      }
    }
  })
}

// 查看详情
const viewDetails = async (row: StockIn) => {
  try {
    // 调用后端接口获取明细
    const response = await api.get(`/stockInDetail/${row.id}`)
    if (response.data.code == 200) {
      currentStockIn.value = row
      // 设置明细数据
      currentStockInDetails.value = [response.data.data] // 如果是数组则使用 response.data.data
      detailDialogVisible.value = true
    } else {
      throw new Error(response.data.message || '获取详情失败')
    }
  } catch (error) {
    console.error('获取入库单详情失败:', error)
    ElMessage.error('获取入库单详情失败')
  }
}

// 审核入库单
const approveStockIn = (id: number) => {
  ElMessageBox.confirm('确定要审核通过这张入库单吗？', '确认审核', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await api.post(`/stock/in/approve/${id}`)
      if (response.data.code == 200) {
        ElMessage.success('审核成功')
        fetchData()
      } else {
        ElMessage.error(response.data.message || '审核失败')
      }
    } catch (error) {
      console.error('审核入库单失败:', error)
      ElMessage.error('审核入库单失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  fetchData()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchData()
}
const getTypeText = (type: number | null | undefined) => {
  switch (type) {
    case 1: return '采购入库'
    case 2: return '退货入库'
    case 3: return '调拨入库'
    default: return ''
  }
}
// 辅助函数

const getStatusText = (status: number | undefined) => {
  switch (status) {
    case 1: return '待审核'
    case 2: return '已完成'
    case 3: return '已取消'
    default: return ''
  }
}

const getStatusTagType = (status: number | undefined) => {
  switch (status) {
    case 1: return '' // 待审核
    case 2: return 'success' // 已完成
    case 3: return 'danger' // 已取消
    default: return ''
  }
}

// 初始化
onMounted(() => {
  fetchData()
  fetchOptions()
  resetForm() // 初始化表单
})
</script>

<style scoped>
.stock-in-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}
</style>
