import { Router } from 'express';
import { saveEditorState, getEditorState } from '../controllers/editor.controller';
import authenticate from '../middlewares/auth.middleware';

const router = Router();

// Secure all routes with the cookie-based JWT middleware
router.use(authenticate);

router.post('/save', saveEditorState);
router.get('/:problemId', getEditorState);

export default router;