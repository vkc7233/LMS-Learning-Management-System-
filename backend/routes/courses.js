const express = require('express');
const router = express.Router();
const {
  getCourses, getCourseById, createCourse, updateCourse,
  deleteCourse, getMyCourses, addLesson,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCourses);
router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), getMyCourses);
router.get('/:id', getCourseById);
router.post('/', protect, authorize('admin', 'instructor'), createCourse);
router.put('/:id', protect, authorize('admin', 'instructor'), updateCourse);
router.delete('/:id', protect, authorize('admin', 'instructor'), deleteCourse);
router.post('/:id/lessons', protect, authorize('admin', 'instructor'), addLesson);

module.exports = router;
