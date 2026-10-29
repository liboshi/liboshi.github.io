---
layout: post
title: Singleton Usage Scenario
description: 单例模式的典型应用场景，附带 Python 实现示例。
tags: [design-pattern, python]
---

Singleton Usage Scenario
========================

**注意:** 这份文档是用Markdown写的。

## 单例模式的常见应用场景

以下列出使用单例模式的一些场景

- Windows的Task Manager(任务管理器)，很典型的单例模式，在Windows中用户只能打开一个Windwos Task Manager。
- Windows的Recycle Bin
- Web Application的配置读取，一边一个网站的配置文件只有一份。
- 应用程序的日志应用，一般是由于共享的日志文件一直处于打开状态，只能有一个实例去操作，否则会出现I/O Error。
- 数据库连接池的设计。
- 多线程的线程池。
- 操作系统的文件系统(File System)的设计。
- HttpApplication也是典型的单例模式的应用。

单例模式应用的厂家那个一般发生在以下条件下：

- 资源共享的情况下，避免由于资源操作时导致的性能或损耗等。如上述中的日志文件，应用配置。
- 控制资源的情况下，方便资源之间的互相通信。如线程池等。

## 示例

Python，单例模式的实现：

    #!/usr/bin/env python
    # -*- coding: utf-8 -*-
    
    class Singleton(type):
        def __init__(cls, name, bases, dict):
            super(Singleton, cls).__init__(name, bases, dict)
            cls._instance = None
    
        def __call__(cls, *args, **kwargs):
            if cls._instance is None:
            cls._instance = super(Singleton, cls).__call__(*args, **kwargs)
            return cls._instance
    
     class MyClass(object):
         __metaclass__ = Singleton
    
    # Test
    if __name__ == '__main__':
        one = MyClass()
        two = MyClass()
        two.a = 123
        print(one.a)
    
        print('>>> one\'s id: ', id(one))
        print('>>> two\'s id: ', id(two))
        if one is two:
        print('Singletion implementation...')
    
    ### OUTPUT ###
    # 123
    # (">>> one's id: ", 140700252715024)
    # (">>> two's id: ", 140700252715024)
    # Singletion implementation...

