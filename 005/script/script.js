(() => {
    // 複数の関数で利用する広いスコープが必要な変数を宣言しておく
    let position = null;
    let color = null;
    let vbo = null;
    let indices = null; // インデックス配列 @@@
    let ibo = null;     // インデックスバッファ @@@
    let uniform = null;
    let mouse = [0, 0];

    // webgl.js に記載のクラスをインスタンス化する
    const webgl = new WebGLUtility();

    // ドキュメントの読み込みが完了したら実行されるようイベントを設定する
    window.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('webgl-canvas');
        webgl.initialize(canvas);
        const size = Math.min(window.innerWidth, window.innerHeight);
        webgl.width  = size;
        webgl.height = size;

        // マウスカーソルが動いた際のイベントを登録しておく
        window.addEventListener('mousemove', (event) => {
            mouse[0] = event.clientX / window.innerWidth;
            mouse[1] = event.clientY / window.innerHeight;
        }, false);

        let vs = null;
        let fs = null;
        WebGLUtility.loadFile('./shader/main.vert')
        .then((vertexShaderSource) => {
            vs = webgl.createShaderObject(vertexShaderSource, webgl.gl.VERTEX_SHADER);
            return WebGLUtility.loadFile('./shader/main.frag');
        })
        .then((fragmentShaderSource) => {
            fs = webgl.createShaderObject(fragmentShaderSource, webgl.gl.FRAGMENT_SHADER);
            webgl.program = webgl.createProgramObject(vs, fs);

            // 頂点とロケーションのセットアップは先に行っておく
            setupGeometry();
            setupLocation();

            render();
        });
    }, false);

    /**
     * 頂点属性（頂点ジオメトリ）のセットアップを行う
     */

	function radian(degree) {
		return ((degree + 90) * Math.PI) / 180;
	}
    function setupGeometry(){

		// 頂点
		position = [];
		color = [];
		indices = [];
		const point = 10;
		const size = 0.5;
		for (let i = 0; i < point; i++) {

			//
			// position
			//
			// x,y,z
			let ratio = 1.0;
			if(i % 2 != 0){
				ratio = 0.38;
			}
			position.push(
				size * ratio * Math.cos(radian((360 / point) * i)),
				size * ratio * Math.sin(radian((360 / point) * i)),
				0.0
			);

			//
			// color
			//
			// r,g,b,a
			color.push(
				Math.abs(Math.sin(i)),
				1.0,
				1.0,
				0.5
			);

			//
			// index
			//
			// if(i < point / 2 ){
			// 	if(i % 2 === 0){
			// 		indices.push(
			// 			i,
			// 			Math.ceil(i+point/4),
			// 			Math.ceil(i+point/4+point/4+1)
			// 		);
			// 		if(Math.ceil(i+point/4+point/4+1) >= point){
			// 			indices[indices.length-1] = 0;
			// 		}
			// 	}
			// }
		}

		//
		// index
		//
		indices = [
			0, 3, 6,
			2, 5, 8,
			4, 7, 0
		];

        vbo = [
            webgl.createVBO(position),
            webgl.createVBO(color),
        ];

        // インデックスバッファを生成する
        ibo = webgl.createIBO(indices);
    }

    /**
     * 頂点属性のロケーションに関するセットアップを行う
     */
    function setupLocation(){
        const gl = webgl.gl;
        // attribute location の取得と有効化
        const attLocation = [
            gl.getAttribLocation(webgl.program, 'position'),
            gl.getAttribLocation(webgl.program, 'color'),
        ];
        const attStride = [3, 4];
        webgl.enableAttribute(vbo, attLocation, attStride);

        // インデックスバッファのバインド
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        // uniform 変数のロケーションを取得する
        uniform = {
            mouse: gl.getUniformLocation(webgl.program, 'mouse'),
        };
    }

    /**
     * レンダリングのためのセットアップを行う
     */
    function setupRendering(){
        const gl = webgl.gl;
        gl.viewport(0, 0, webgl.width, webgl.height);
        gl.clearColor(0.3, 0.3, 0.3, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    /**
     * レンダリングを行う
     */
    function render(){
        const gl = webgl.gl;

        // 再帰呼び出しを行う
        requestAnimationFrame(render);

        // レンダリング時のクリア処理など
        setupRendering();

        // uniform 変数は常に変化し得るので毎フレーム値を送信する
        gl.uniform2fv(uniform.mouse, mouse);

        // 登録されている VBO と IBO を利用して描画を行う @@@
		// IBOを使う場合はdrawElementsを使う必要がある
        // gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }
})();

