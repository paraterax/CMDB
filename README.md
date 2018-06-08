## 环境安装
首先需要安装nodejs, v5.x
官网： https://nodejs.org/

ps：之后如果编译有报node-gyp相关的错误，请看这里

https://github.com/nodejs/node-gyp

需要安装python2.7, windows系统还需要VS2013或者VS2015.

## 代码编辑工具
强烈推荐VSCODE，微软出的一个很小的IDE，更像编辑器。

因为它集成了我们需要的几个重要东西，git， 配置式的任务，node调试。让我们可以不用切换到命令行，一切都在这个IDE里可以搞定。

另外，我们框架中也包含了VSCODE的一些配置。

VSCODE下载地址： https://code.visualstudio.com/

其他的话，就推荐sublime Text，再其他，看个人喜好吧，都可以。

## 工程初始化
`git clone --recursive git@git.paratera.net:ParaData/CMDB.git`

`cd CMDB`

`npm install`

`npm start`

然后打开 http://localhost:3000  看到一个登录界面说明环境搭建完毕

## 产品发布
开发完毕后，使用以下命令打包发布

`npm run build`

`dist/` 目录下就是打包好后的文件，拷到服务器上即可。