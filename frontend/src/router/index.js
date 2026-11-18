import { createRouter, createWebHistory } from 'vue-router';
import StudentsView from '@/views/StudentsView.vue';

const routes = [
  { path: '/', name: 'students', component: StudentsView, meta: { title: 'Students' } },
  { path: '/students', redirect: { name: 'students' } },
  {
    path: '/courses',
    name: 'courses',
    component: () => import('@/views/CoursesView.vue'),
    meta: { title: 'Courses' },
  },
  {
    path: '/enrollments',
    name: 'enrollments',
    component: () => import('@/views/EnrollmentsView.vue'),
    meta: { title: 'Enrollments' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page Not Found' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
  linkActiveClass: 'is-active',
});

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Home'} | Student Management System`;
});

export default router;
