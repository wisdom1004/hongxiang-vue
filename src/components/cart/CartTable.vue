<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <div v-if="!items.length" class="text-center py-5 text-muted">
    购物车暂无商品，<router-link to="/agri">去农产商城选购</router-link>
  </div>
  <table v-else class="table table-bordered align-middle mb-0">
    <thead>
      <tr>
        <th width="60">选择</th>
        <th>商品名称</th>
        <th>单价</th>
        <th>数量</th>
        <th>小计</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.productId">
        <td>
          <input
            class="form-check-input"
            type="checkbox"
            :checked="checkedIds.includes(item.productId)"
            @change="emit('toggle', item.productId)"
          >
        </td>
        <td>{{ item.name }}</td>
        <td>¥{{ fixed(item.price) }}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" @click="emit('setNum', item.productId, item.num - 1)">-</button>
          <span class="mx-2">{{ item.num }}</span>
          <button class="btn btn-sm btn-outline-secondary" @click="emit('setNum', item.productId, item.num + 1)">+</button>
        </td>
        <td class="text-danger">¥{{ fixed(item.price * item.num) }}</td>
        <td><button class="btn btn-sm btn-danger" @click="emit('remove', item.productId)">删除</button></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  checkedIds: { type: Array, default: () => [] }
})
const emit = defineEmits(['toggle', 'setNum', 'remove'])

function fixed (n) {
  return (Number(n) || 0).toFixed(2)
}
</script>
