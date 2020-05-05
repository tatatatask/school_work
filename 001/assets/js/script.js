(() => {
	// 汎用変数
	let run = true; // レンダリングループフラグ
	let isDown = false; // スペースキーが押されているかどうかのフラグ

	// three.js に関連するオブジェクト用の変数
	let scene; // シーン
	let camera; // カメラ
	let renderer; // レンダラ
	let geometry; // ジオメトリ
	let geometryEdge; // ジオメトリ エッジ
	let material; // マテリアル
	let materialEdge; // マテリアル エッジ
	let controls; // カメラコントロール
	let axesHelper; // 軸ヘルパーメッシュ
	let directionalLight; // ディレクショナル・ライト（平行光源）
	let ambientLight; // アンビエントライト（環境光）

	// シーン追加用グループ
	let objGroup;

	// datguiパラメータ
	const ___param = {
		color: 0x25b25,
		size: 1.0,
		count_x: 10,
		count_y: 10,
		changeGeometry: false,
		changeMaterial: false,
		changeObject: false,
	};

	// DOM LOADED
	window.addEventListener(
		"DOMContentLoaded",
		() => {
			// datgui
			const gui = new dat.GUI();
			gui.addColor(___param, "color").onFinishChange(() => {
				reRender();
			});
			gui.add(___param, "size", 0.1, 3.0, 0.1).onFinishChange(() => {
				reRender();
			});
			gui.add(___param, "count_x", 1, 100, 1).onFinishChange(() => {
				reRender();
			});
			gui.add(___param, "count_y", 1, 100, 1).onFinishChange(() => {
				reRender();
			});
			gui.add(___param, "changeGeometry").onFinishChange(() => {
				changeGeometry();
			});
			gui.add(___param, "changeMaterial").onFinishChange(() => {
				changeMaterial();
			});
			gui.add(___param, "changeObject").onFinishChange(() => {
				reRender();
			});

			// 初期化処理
			init();

			// キーダウンイベントの定義
			window.addEventListener(
				"keydown",
				(event) => {
					switch (event.key) {
						case "Escape":
							run = event.key !== "Escape";
							break;
						case " ":
							isDown = true;
							break;
						default:
					}
				},
				false,
			);
			window.addEventListener(
				"keyup",
				(event) => {
					isDown = false;
				},
				false,
			);

			// リサイズイベントの定義
			window.addEventListener(
				"resize",
				() => {
					renderer.setSize(window.innerWidth, window.innerHeight);
					camera.aspect = window.innerWidth / window.innerHeight;
					camera.updateProjectionMatrix();
				},
				false,
			);

			// 描画処理
			run = true;
			render();
		},
		false,
	);

	// カメラに関するパラメータ
	const CAMERA_PARAM = {
		fovy: 60,
		aspect: window.innerWidth / window.innerHeight,
		near: 0.1,
		far: 60.0,
		x: 0.0,
		y: 0.0,
		z: 10.0,
		lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
	};
	// レンダラに関するパラメータ
	const RENDERER_PARAM = {
		clearColor: 0x666666,
		width: window.innerWidth,
		height: window.innerHeight,
	};
	// マテリアルのパラメータ
	let MATERIAL_PARAM = {
		color: 0x25b25,
		specular: 0xffffff,
	};
	// ライトに関するパラメータの定義
	const DIRECTIONAL_LIGHT_PARAM = {
		color: 0xffffff,
		intensity: 1.0,
		x: 1.0,
		y: 1.0,
		z: 1.0,
	};
	// アンビエントライトに関するパラメータの定義
	const AMBIENT_LIGHT_PARAM = {
		color: 0xffffff,
		intensity: 0.2,
	};

	// 初期化
	function init() {
		// シーン生成
		scene = new THREE.Scene();

		// レンダラ
		renderer = new THREE.WebGLRenderer({});
		renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
		renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height);
		const wrapper = document.querySelector("#webgl");
		wrapper.appendChild(renderer.domElement);

		// 軸ヘルパー追加
		axesHelper = new THREE.AxesHelper(10.5);
		scene.add(axesHelper);

		// カメラ追加
		camera = new THREE.PerspectiveCamera(CAMERA_PARAM.fovy, CAMERA_PARAM.aspect, CAMERA_PARAM.near, CAMERA_PARAM.far);
		camera.position.set(CAMERA_PARAM.x, CAMERA_PARAM.y, CAMERA_PARAM.z);
		camera.lookAt(CAMERA_PARAM.lookAt);

		// コントロール追加
		controls = new THREE.OrbitControls(camera, renderer.domElement);

		// ディレクショナルライト追加
		directionalLight = new THREE.DirectionalLight(DIRECTIONAL_LIGHT_PARAM.color, DIRECTIONAL_LIGHT_PARAM.intensity);
		directionalLight.position.x = DIRECTIONAL_LIGHT_PARAM.x;
		directionalLight.position.y = DIRECTIONAL_LIGHT_PARAM.y;
		directionalLight.position.z = DIRECTIONAL_LIGHT_PARAM.z;
		scene.add(directionalLight);

		// アンビエントライト
		ambientLight = new THREE.AmbientLight(AMBIENT_LIGHT_PARAM.color, AMBIENT_LIGHT_PARAM.intensity);
		scene.add(ambientLight);

		// メッシュ生成
		objGroup = createObject();

		// シーンに追加
		scene.add(objGroup);
	}

	// フレームごとの処理
	function render() {
		// 再帰呼び出し
		if (run === true) {
			requestAnimationFrame(render);
		}

		// スペースキーが押されている場合メッシュを回転させる
		if (isDown === true) {
			objGroup.children.forEach((obj) => {
				obj.rotation.y += 0.02;
				obj.rotation.z += 0.02;
			});
		}

		// 描画
		renderer.render(scene, camera);
	}

	// メッシュグループ生成
	function createObject() {
		const color = ___param.color;
		MATERIAL_PARAM.color = color;
		const size = ___param.size;
		const count_x = ___param.count_x;
		const count_y = ___param.count_y;
		const group = new THREE.Group();

		// BOXジオメトリ生成
		geometry = new THREE.BoxGeometry(size, size, size);
		// トーラスジオメトリ生成
		geometryTorus = new THREE.TorusGeometry(size * 0.5, size * 0.1, 4, 4);

		// マテリアル（フォン）
		material = new THREE.MeshPhongMaterial(MATERIAL_PARAM);
		// マテリアル（トゥーン）
		materialToon = new THREE.MeshToonMaterial(MATERIAL_PARAM);

		// エッジ用BOXジオメトリ
		geometryEdge = new THREE.EdgesGeometry(geometry);
		// エッジ用トーラスジオメトリ
		geometryTorusEdge = new THREE.EdgesGeometry(geometryTorus);
		// エッジ用マテリアル
		materialEdge = new THREE.LineBasicMaterial({color: color});

		// 生成ループ
		let obj;
		let x,
			y = 0;
		for (let i = 0; i < count_x * count_y; ++i) {
			x = x + size;
			if (i % count_x === 0) {
				x = 0;
				y = y + size;
			}

			// オブジェクト生成&配置
			if (!___param.changeObject) {
				obj = new THREE.Mesh(geometry, material);
			} else {
				obj = new THREE.LineSegments(geometryEdge, materialEdge);
			}

			obj.position.x = x - size * count_x * 0.5 + size * 0.5;
			obj.position.y = y - size * count_y * 0.5 - size * 0.5;
			obj.position.z = 0;

			// グループにメッシュ追加
			group.add(obj);
		}
		return group;
	}

	// ジオメトリ変更
	function changeGeometry() {
		let afterChange;
		if (!___param.changeObject) {
			if (!___param.changeGeometry) {
				afterChange = geometry;
			} else {
				afterChange = geometryTorus;
			}
		} else {
			if (!___param.changeGeometry) {
				afterChange = geometryEdge;
			} else {
				afterChange = geometryTorusEdge;
			}
		}
		objGroup.children.forEach((obj) => {
			obj.geometry = afterChange;
		});
	}

	// マテリアル変更
	function changeMaterial() {
		let afterChange;
		if (!___param.changeObject) {
			if (!___param.changeMaterial) {
				afterChange = material;
			} else {
				afterChange = materialToon;
			}
		} else {
			afterChange = materialEdge;
		}

		objGroup.children.forEach((obj) => {
			obj.material = afterChange;
		});
	}

	// 回転を保持して再配置
	function reRender() {
		const currentRotate = {
			x: objGroup.children[0].rotation.x,
			y: objGroup.children[0].rotation.y,
			z: objGroup.children[0].rotation.z,
		};
		scene.remove(objGroup);

		// メッシュ生成
		objGroup = createObject();
		objGroup.children.forEach((obj) => {
			obj.rotation.x = currentRotate.x;
			obj.rotation.y = currentRotate.y;
			obj.rotation.z = currentRotate.z;
		});
		changeGeometry();
		changeMaterial();

		// シーンに追加
		scene.add(objGroup);
	}
})();
