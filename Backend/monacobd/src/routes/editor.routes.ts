import { Router } from 'express';
import { saveEditorState, getEditorState, resetEditorState } from '../controllers/editor.controller';
import authenticate from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/save', saveEditorState);
router.get('/:problemId', getEditorState);
// NEW: Reset endpoint
router.post('/:problemId/reset', resetEditorState);

export default router;