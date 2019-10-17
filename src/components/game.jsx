import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
import { Game } from "@rahoi/ch3ss_logic/dist/Game";
import { Knight } from "@rahoi/ch3ss_logic/dist/Knight";
import { King } from "@rahoi/ch3ss_logic/dist/King";
import { Bishop } from "@rahoi/ch3ss_logic/dist/Bishop";
import { Rook } from "@rahoi/ch3ss_logic/dist/Rook";
import { Unicorn } from "@rahoi/ch3ss_logic/dist/Unicorn";
import { Pawn } from "@rahoi/ch3ss_logic/dist/Pawn";
import { Queen } from "@rahoi/ch3ss_logic/dist/Queen";
import { BLACK, WHITE } from "@rahoi/ch3ss_logic/dist/constants";

const WHITE_COLOR = 0xffffff;
const BLACK_COLOR = 0x000000;
const BOARD_COLOR = 0xfdfdfd;
const SELECTED_COLOR = 0xff0000;

const whiteMaterial = new THREE.MeshLambertMaterial({color: WHITE_COLOR});
const blackMaterial = new THREE.MeshLambertMaterial({color: BLACK_COLOR});

const pawnGeometry = new THREE.SphereGeometry(0.3, 16, 12);
const rookGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const bishopGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.5, 16);
const knightGeometry = new THREE.OctahedronGeometry(0.3);
const unicornGeometry = new THREE.IcosahedronGeometry(0.3);
const kingGeometry = new THREE.TetrahedronGeometry(0.5);
const queenGeometry = new THREE.ConeGeometry(0.25, 0.75, 16);

const boardMaterial = new THREE.MeshLambertMaterial({color: BOARD_COLOR, transparent: true, opacity: 0.05});
const boardGeometry = new THREE.BoxGeometry(1, 1, 1);
const boardDimension = 5;
const board = new THREE.Group();

let SELECTED_PIECE = null;
let VALID_SPACES = null;
let PIECE_SELECTION_MODE = true;

function buildBoard(scene) {
    for (let x = 0; x < boardDimension; x++) {
        for (let y = 0; y < boardDimension; y++) {
            for (let z = 0; z < boardDimension; z++) {
                const cube = new THREE.Mesh(boardGeometry, boardMaterial.clone());
                cube.position.set(x - 2, y - 2, z - 2);

                cube.userData.x = x;
                cube.userData.y = y;
                cube.userData.z = z;

                cube.userData.type = "space";
                board.add(cube);
            }
        }
    }

    scene.add(board);
}

function getGamePositionFromObject(object) {
    let position_3D = object.position;

    let x = position_3D.x + 3;
    let y = position_3D.y + 3;
    let z = position_3D.z + 3;

    let positionString = x.toString() + y.toString() + z.toString();

    let gamePosition = currentGame.getPositionFromString(positionString);

    return gamePosition;
}

function setValidSpaces() {
    let piecePosition = getGamePositionFromObject(SELECTED_PIECE);
    let validPositions = currentGame.getPossibleMovesForPieceAtSpace(piecePosition);

    let validSpaces = [];
    let position;
    let space;

    for (let i = 0; i < validPositions.length; i++) {
        position = validPositions[i].getPostionString();
        for (let j = 0; j < board.children.length; j++) {
            space = board.children[j];
            let spaceGamePosition = getGamePositionFromObject(space).getPostionString();
            if (spaceGamePosition === position) {
                validSpaces.push(space);
            }
        }
    }

    VALID_SPACES = validSpaces;
}

function highlightValidSpaces() {
    if (VALID_SPACES != null) {
        for (let i = 0; i < VALID_SPACES.length; i++) {
            let space = VALID_SPACES[i];
            space.material.color.setHex(SELECTED_COLOR);
        }
    }
}

function highlightSelectedPiece() {
    if (SELECTED_PIECE !== null) {
        SELECTED_PIECE.material.color.setHex(SELECTED_COLOR);
    }
}

function unhighlightSelectedPiece() {
    if (SELECTED_PIECE != null) {
        if (SELECTED_PIECE.userData.color === "white") {
            SELECTED_PIECE.material.color.setHex(WHITE_COLOR);
        }

        if (SELECTED_PIECE.userData.color === "black") {
            SELECTED_PIECE.material.color.setHex(BLACK_COLOR);
        }
    }
}

function unhighlightSpaces() {
    if (VALID_SPACES != null) {
        for (let i = 0; i < VALID_SPACES.length; i++) {
            let space = VALID_SPACES[i];
            space.material.color.setHex(BOARD_COLOR);
        }
    }
}

function createPieceMesh(piece, group) {
    let newGeometry;
    let newPiece;

    if (piece instanceof Pawn) {
        newGeometry = pawnGeometry;
    }
    if (piece instanceof Knight) {
        newGeometry = knightGeometry;
    }

    if (piece instanceof Bishop) {
        newGeometry = bishopGeometry;
    }

    if (piece instanceof Unicorn) {
        newGeometry = unicornGeometry;
    }

    if (piece instanceof Rook) {
        newGeometry = rookGeometry;
    }

    if (piece instanceof Queen) {
        newGeometry = queenGeometry;
    }

    if (piece instanceof King) {
        newGeometry = kingGeometry;
    }

    if (piece.color === WHITE) {
        newPiece = new THREE.Mesh(newGeometry, whiteMaterial.clone());
        newPiece.userData.color = "white";
    }
    if (piece.color === BLACK) {
        newPiece = new THREE.Mesh(newGeometry, blackMaterial.clone());
        newPiece.userData.color = "black";
    }

    newPiece.userData.type = "piece";

    let newPosition = piece.getPosition();

    newPiece.position.set(newPosition.getX() - 3, newPosition.getY() - 3, newPosition.getZ() - 3);

    group.add(newPiece);
}

let currentGame = new Game();

export default class LiveGame extends Component {
    componentDidMount() {
        const scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.rotation.order = 'YXZ';
        camera.position.y = -7;
        camera.lookAt(0, 0, 0);

        let renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor("#ffffff");
        renderer.setSize(window.innerWidth, window.innerHeight);

        this.mount.appendChild(renderer.domElement);

        const OrbitControls = require('three-orbitcontrols');
        let controls = new OrbitControls(camera, renderer.domElement);

        const light = new THREE.AmbientLight(0xd3d3d3);
        scene.add(light);

        buildBoard(scene);

        let currentPieces = currentGame.getPieces();
        let {pieces, liveGame} = this.props

        if(liveGame !== undefined) {
            currentPieces = pieces;
        }

        let whitePiecesGroup = new THREE.Group();
        let blackPiecesGroup = new THREE.Group();

        for (var i = 0; i < currentPieces.length; i++) {
            if (currentPieces[i].color === WHITE) {
                createPieceMesh(currentPieces[i], whitePiecesGroup);
            }

            if (currentPieces[i].color === BLACK) {
                createPieceMesh(currentPieces[i], blackPiecesGroup);
            }
        }

        scene.add(whitePiecesGroup);
        scene.add(blackPiecesGroup);

        let mouse = new THREE.Vector2();

        window.addEventListener('mousedown', onMouseDown, false);

        animate();

        function animate() {
          requestAnimationFrame(animate);
	        render();
	        update();
        }

        function update() {
            let ray = new THREE.Raycaster();
            ray.setFromCamera(mouse, camera);
            controls.update();
        }

        function render() {
	        renderer.render(scene, camera);
        }

        function onMouseDown( event ) {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
          let ray = new THREE.Raycaster();
          ray.setFromCamera(mouse, camera);
          let intersects = ray.intersectObjects(scene.children, true);

          if (PIECE_SELECTION_MODE) {
            let aPieceWasSelected = false;
            let intersection = -1;

            if (intersects.length > 0) {
              for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.userData.type === "piece") {
                  aPieceWasSelected = true;
                  intersection = i;
                  break;
                }
              }
            }

            if (aPieceWasSelected) {
              if (SELECTED_PIECE !== null && SELECTED_PIECE !== intersects[intersection].object) {
                unhighlightSelectedPiece();
              }

              SELECTED_PIECE = intersects[intersection].object;
              unhighlightSpaces();
              highlightSelectedPiece();
              setValidSpaces();
              highlightValidSpaces();
            }
          }
        }
      }

    render() {
        return (
            <div className = "Gamespace" ref={ref => (this.mount = ref)}>
            </div>
        )
    }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<LiveGame />, rootElement);
