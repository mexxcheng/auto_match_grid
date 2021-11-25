const fs = require('fs');
const axios = require('axios');
const config = require('./config');
const workName = config.name + new Date().getTime();
fs.mkdirSync('./output/'+workName);
; (async () => {
    console.time('任务耗时');
    const listRes = await getList();
    const list = listRes.data;
    fs.writeFileSync('./cache/' + new Date().getTime() + '.log', JSON.stringify(list));
    const success_arr=[];
    const fail_arr=[];
    const success_add_arr=[];
    list.pop();
    for( const camera of list ){
        console.log(camera['device_name']);
        const gridRes = await getGrid(camera['build_id'], camera['floor_id'], camera['list_style'], camera['indoor']);
        console.log(gridRes);
        if( gridRes.data.length>0 ){
            success_arr.push(camera);
            const c=await touchin(camera,gridRes.data[0].id,gridRes.data[0]);
            console.log(c);
            success_add_arr.push(c);
        }else{
            fail_arr.push(camera);
        }
    }
    fs.writeFileSync('./output/'+workName+'/success_arr.json',JSON.stringify(success_arr));
    fs.writeFileSync('./output/'+workName+'/fail_arr.json',JSON.stringify(fail_arr));
    fs.writeFileSync('./output/'+workName+'/success_add_arr.json',JSON.stringify(success_add_arr));
    console.timeEnd('任务耗时');
})();

function touchin(data,grid_id,grid_info) {
    return commonReq('device/camera/touchin', {
        model_name: data.model_name,
        category_name: data.category_name,
        type_name: data.type_name,
        device_name: data.device_name,
        region_id: data.region_id,
        type_id: data.type_id,
        model_url: data.model_url,
        center: data.center,
        list_style: data.list_style,
        position: data.position,
        device_code: data.device_code,
        category_id: data.category_id,
        indoor: data.indoor,
        build_id: data.build_id,
        floor_id: data.floor_id,
        id: data.id,
        grid_id,grid_info
    });
}


function getList() {
    return commonReq('device/camera/listS', { category_id: "10001" });
}

function getGrid(build_id, floor_id, positions, indoor = true) {
    const data = { build_id, floor_id, indoor, positions: { ...positions, x: positions.x / 100, y: positions.y / 100 } };
    return commonReq('device/region', data);
}

// 标准化请求
function commonReq(url, data) {
    return new Promise(resolve => {
        axios({
            method: 'post',
            url: config.baseUrl + url,
            data
        }).then(response => {
            const res = response.data;
            resolve(res);
        });
    });
}

function sleep(s = 0) {
    return new Promise(resolve => setTimeout(() => { resolve() }, s));
}