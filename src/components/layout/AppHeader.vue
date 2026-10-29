<template>
  <nav class="navbar navbar-expand-lg navbar-dark sticky-top">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/"><i class="bi bi-robot me-2"></i>红乡智推</router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
        aria-label="切换导航"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="navMenu" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/" :class="{ active: route.name === 'home' }">首页</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/agri" :class="{ active: route.name === 'agri' }">助农专区</router-link>
          </li>
          <li v-if="user.isLoggedIn" class="nav-item">
            <router-link class="nav-link" to="/user" :class="{ active: route.name === 'user' }">我的主页</router-link>
          </li>
          <li v-if="user.isLoggedIn" class="nav-item">
            <router-link class="nav-link cart-badge" to="/cart" :class="{ active: route.name === 'cart' }">
              <span class="cart-icon">
                <i class="bi bi-cart3"></i>
                <span class="cart-count" v-if="cart.count > 0">{{ cart.count }}</span>
              </span>
            </router-link>
          </li>
          <li v-if="!user.isLoggedIn" class="nav-item">
            <router-link class="nav-link" to="/login" :class="{ active: route.name === 'login' }">登录/注册</router-link>
          </li>
          <li v-else class="nav-item user-menu" :class="{ 'is-open': menuOpen }">
            <button class="nav-link user-trigger" type="button" aria-haspopup="true" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
              <i class="bi bi-person-circle"></i>
            </button>
            <div class="user-menu__panel">
              <div class="user-menu__head">
                <i class="bi bi-person-circle"></i>
                <div>
                  <b>{{ user.displayName }}</b>
                  <span>{{ user.currentUser.account }}</span>
                </div>
              </div>
              <router-link class="user-menu__item" to="/user" @click="menuOpen = false">
                <i class="bi bi-house-door"></i>我的主页
              </router-link>
              <router-link class="user-menu__item" to="/cart" @click="menuOpen = false">
                <i class="bi bi-cart3"></i>购物车
              </router-link>
              <button class="user-menu__item" type="button" @click="logout">
                <i class="bi bi-box-arrow-right"></i>退出登录
              </button>
            </div>
          </li>
          <li class="nav-item" v-if="user.isLoggedIn">
            <router-link class="nav-link" to="/admin" :class="{ active: route.name === 'admin' }">运营后台</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/about" :class="{ active: route.name === 'about' }">项目概况</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const user = useUserStore()
const ui = useUiStore()

const menuOpen = ref(false)

watch(() => route.fullPath, () => { menuOpen.value = false })

function logout () {
  user.logout()
  menuOpen.value = false
  ui.show('已退出登录', 'bi-box-arrow-right')
  if (route.meta && route.meta.requiresAuth) router.replace('/')
}
</script>

<style scoped>
/* 桌面端导航项统一等宽，文字与图标都居中 */
@media (min-width: 992px) {
  .navbar-nav .nav-link {
    width: 92px;
    padding: 16px 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    white-space: nowrap;
  }
}

/* 购物车图标 + 右上角圆形数量标签 */
.cart-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cart-icon > i { font-size: 18px; line-height: 1; }
.cart-count {
  position: absolute;
  top: -8px;
  right: -12px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 9px;
  background: #c0392b;
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  line-height: 17px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .25);
}

/* 登录后的人像菜单：悬浮 / 点击展开 */
.user-menu { position: relative; }
.user-trigger {
  border: 0;
  background: none;
  color: #fff;
  cursor: pointer;
}
.user-trigger > i { font-size: 19px; line-height: 1; }
.user-menu__panel {
  position: absolute;
  right: 0;
  top: 100%;
  width: 178px;
  padding: 6px 0 8px;
  background: #fff;
  border: 1px solid #e5ded3;
  border-radius: 4px;
  box-shadow: 0 8px 22px rgba(90, 54, 30, .14);
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px);
  transition: opacity .16s ease, transform .16s ease, visibility .16s;
  z-index: 1030;
}
.user-menu:hover .user-menu__panel,
.user-menu.is-open .user-menu__panel {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.user-menu__head {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 14px 10px;
  border-bottom: 1px solid #efe8dd;
  margin-bottom: 4px;
}
.user-menu__head > i { font-size: 24px; color: #c0392b; }
.user-menu__head b { display: block; font-size: 13px; color: #2b2521; line-height: 1.3; }
.user-menu__head span { display: block; font-size: 11.5px; color: #8a8177; }
.user-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 14px;
  border: 0;
  background: none;
  text-align: left;
  font-size: 13px;
  color: #4b433c;
  text-decoration: none;
}
.user-menu__item:hover { background: #f7f2ea; color: #7a1006; }
.user-menu__item i { color: #b8860b; font-size: 13px; }
</style>
