package com.campus.secondhand.controller;

import com.campus.secondhand.common.Result;
import com.campus.secondhand.entity.Category;
import com.campus.secondhand.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 商品分类Controller
 */
@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * 获取所有分类
     * @return 分类列表
     */
    @GetMapping("/all")
    public Result<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return Result.success(categories, "获取分类列表成功");
    }

    /**
     * 根据父分类ID获取子分类
     * @param parentId 父分类ID
     * @return 子分类列表
     */
    @GetMapping("/children")
    public Result<List<Category>> getCategoriesByParentId(@RequestParam Long parentId) {
        List<Category> categories = categoryService.getCategoriesByParentId(parentId);
        return Result.success(categories, "获取子分类列表成功");
    }

    /**
     * 获取一级分类
     * @return 一级分类列表
     */
    @GetMapping("/level-one")
    public Result<List<Category>> getLevelOneCategories() {
        List<Category> categories = categoryService.getLevelOneCategories();
        return Result.success(categories, "获取一级分类列表成功");
    }

}