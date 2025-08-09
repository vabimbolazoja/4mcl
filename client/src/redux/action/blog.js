import { BLOGS,BLOG, LOADING_BLOG, ERROR } from "./types";
import blogService from "../../services/blog-service";
import { generalErrMsg } from "../../helperFunctions";
import { error } from "../../components/Alert";

export const getBlogs = (query) => async (dispatch) => {
  try {
    const result = await blogService.getBlogs(query);
    dispatch({
      type: BLOGS,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};


export const getBlog = (id) => async (dispatch) => {
  try {
    const result = await blogService.getBlog(id);
    dispatch({
      type: BLOG,
      payload: result,
    });
  } catch (err) {
    const message = err?.response?.data?.message;
    dispatch({
      type: ERROR,
      payload: message || generalErrMsg,
    });
    error("Error!", message || generalErrMsg);
  }
};