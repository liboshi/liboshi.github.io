---
layout: post
title: GNU Build System
description: Walkthrough of the GNU Autotools flow from configure.ac to autoconf and automake.
tags: [autotools, build-system]
---

GNU Build Sytem
=================

*   [Overview](#overview)
*   [Sample](#sample)
*   [Build](#build)

**Notice:** This guide is written with Markdown.

* * *

<h2 id="overview">Overview</h2>

From Wikipedia:

The GNU build system, also known as the Autotools, is a suite of programming tools designed to assist in making source code packages portable to many Unix-like systems.

It can be difficult to make a software program portable: the C compiler differs from system to system; certain library functions are missing on some systems; header files may have different names. One way to handle this is to write conditional code, with code blocks selected by means of preprocessor directives (#ifdef); but because of the wide variety of build environments this approach quickly becomes unmanageable. Autotools is designed to address this problem more manageably.

<h2 id="sample">Sample</h2>

### Working tree
* source in src/
* documentation in doc/
* man page in man/
* scripts in scripts/
* examples in examples/

### Cleaning up

    Move away every possible Makefile you have in the package.

### Generating configure.ac
    
    $ autoscan
    $ mv configure.scan configure.ac
    

### Adjusting things
    
    $ vim configure.ac

    AC_INIT([FULL-PACKAGE-NAME], [VERSION], [BUG-REPORT-ADDRESS])
    -->
    AC_INIT([hellworld], [1.0.0], [bugzilla.com])
    

### Generating a first `configure` script
    
    $ autoconf
    

### Generating a suitable `Makefile`
    
    $ vim Makefile.am

    AUTOMAKE_OPTIONS = foreign
    SUBDIRS = src doc examples man scripts

    $ vim src/Makefile.am

    # what flags you want to pass to the C compiler & linker
    CFLAGS = --pedantic -Wall -std=c99 -O2
    LDFLAGS =

    # this lists the binaries to produce, the (non-PHONY, binary) targets in
    # the previous manual Makefile
    bin_PROGRAMS = targetbinary1 targetbinary2 [...] targetbinaryN
    targetbinary1_SOURCES = targetbinary1.c myheader.h [...]
    targetbinary2_SOURCES = targetbinary2.c
    .
    .
    .
    targetbinaryN_SOURCES = targetbinaryN.c

    $ vim man/Makefile.am

    man_MANS = firstman.1 secondman.8 thirdman.3 [...]

    $ vim scripts/Makefile.am

    bin_SCRIPTS = script1.sh script2.sh [...]

    $ vim doc/Makefile.am

    docdir = $(datadir)/doc/@PACKAGE@
    doc_DATA = README DONTS

    $ vim examples/Makefile.am

    exampledir = $(datarootdir)/doc/@PACKAGE@
    example_DATA = sample1.dat sample2.dat [...]
    

### Integrating the checking `autoconf` part and the building `automake` part
    
    $ vim configure.ac

    Rather after AC_INIT(), initialize automake
    AM_INIT_AUTOMAKE
    Then, generate a configure script that will output Makefiles for all of the
    above directories.
    AC_OUTPUT(Makefile src/Makefile doc/Makefile examples/Makefile man/Makefile scripts/Makefile)
    

### Making tools output the configure script and Makefile templates
    
    $ aclocal
    This generate a file `aclocal.m4` that cantains macros for automake things,
    e.g. AM_INIT_AUTOMAKE

    $ automake --add-missing
    Automake now reads configure.ac and the top-level Makefile.am, interprets
    them (e.g. see further work has to be done in some subdirectories) and,
    for each Makefile.am produces a Makefile.in. The argument --add-missing
    tells automake to provide default scripts for reporting errors,
    installing etc, so it can be omitted in the next runs.

    $ autoconf
    

<h2 id="build">Build</h2>

### How to build after autoconf
    
    $ ./configure
    $ make
    $ make install
    $ make clean
    

