<template>
  <Teleport to="body">
    <div ref="el" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-patch-check me-2"></i>农产品溯源档案</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
          </div>
          <div class="modal-body">
            <div v-if="state.loading" class="hf-ai__loading">
              <span class="hf-spinner"></span>正在调取产地溯源数据…
            </div>

            <div v-else-if="state.error" class="hf-empty">
              <i class="bi bi-cloud-slash"></i>{{ state.error }}
            </div>

            <template v-else-if="state.data">
              <div class="d-flex justify-content-between flex-wrap align-items-start mb-3">
                <div>
                  <h4 class="mb-1" style="font-size:19px;">{{ product.name }}</h4>
                  <div class="text-muted small">
                    {{ product.province }}{{ product.city }} · {{ product.region_name }} · {{ product.coop }}
                  </div>
                </div>
                <div class="text-end">
                  <div class="small text-muted">溯源码</div>
                  <div style="font-family:'DIN Alternate',monospace;font-weight:800;color:#7a1006;">{{ state.data.code }}</div>
                </div>
              </div>
              <div class="row g-2 mb-3">
                <div class="col-4">
                  <div class="map-detail__cell"><span>批次</span><b>{{ state.data.batch }}</b></div>
                </div>
                <div class="col-4">
                  <div class="map-detail__cell"><span>带动农户</span><b>{{ num(product.farmers) }} 户</b></div>
                </div>
                <div class="col-4">
                  <div class="map-detail__cell"><span>品类</span><b style="font-size:14px;">{{ product.cat }}</b></div>
                </div>
              </div>
              <div class="hf-timeline">
                <div v-for="(e, i) in state.data.events" :key="i" class="hf-timeline__item is-done">
                  <div class="hf-timeline__time">{{ e.time }}</div>
                  <div class="hf-timeline__title">{{ e.title }}</div>
                  <div class="hf-timeline__desc">{{ e.desc }}</div>
                  <div class="hf-timeline__meta">{{ e.operator }} · {{ e.place }}</div>
                </div>
              </div>
              <div class="alert alert-light border mt-2 mb-0 small text-muted">
                溯源数据由产地合作社与县级质检机构回传，一物一码。
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useBsModal } from '@/composables/useBsModal'
import { useTrace } from '@/composables/useTrace'
import { num } from '@/utils/format'

const el = ref(null)
const modal = useBsModal(el)
const { state, close } = useTrace()
const product = computed(() => (state.data && state.data.product) || {})

watch(() => state.open, open => {
  if (open) modal.show()
  else modal.hide()
})

// 关闭按钮 / 遮罩 / ESC 关闭弹窗时同步状态，否则下次 set state.open=true 不触发 watch，弹窗打不开
function onHidden () {
  close()
}

onMounted(() => {
  if (el.value) el.value.addEventListener('hidden.bs.modal', onHidden)
})

onBeforeUnmount(() => {
  if (el.value) el.value.removeEventListener('hidden.bs.modal', onHidden)
})
</script>
