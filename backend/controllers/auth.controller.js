const svc = require('../services/auth.service');
const { sendSuccess } = require('../utils/response.utils');

exports.signup  = async (req,res,next) => { try { sendSuccess(res, await svc.signup(req.body,res), 'Account created',201); } catch(e){next(e);} };
exports.login   = async (req,res,next) => { try { sendSuccess(res, await svc.login(req.body,res),  'Login successful');      } catch(e){next(e);} };
exports.refresh = async (req,res,next) => { try { sendSuccess(res, await svc.refresh(req,res),     'Token refreshed');       } catch(e){next(e);} };
exports.logout  = async (req,res,next) => { try { await svc.logout(req,res); sendSuccess(res,null,'Logged out'); }            catch(e){next(e);} };
exports.getMe   = async (req,res,next) => { try { sendSuccess(res, await svc.getMe(req.user._id)); }                         catch(e){next(e);} };
