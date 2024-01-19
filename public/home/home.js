const dl = [   document.querySelector('.banner'),  document.querySelector('.planner'),    document.querySelector('.calendar'),]

const inter_height = 800;
const buffer_height = 0;
const small_buffer_height = 40;
const div_heights = [];
for(const div of dl) div_heights.push(div.getBoundingClientRect().height);
// div_heights[0] += 100;
const div_hsum = [0];
for(let i = 1; i < div_heights.length; i++) div_hsum.push(div_hsum[i-1] + div_heights[i]);

const snapRange = 700;

window.addEventListener('scroll', () => {
    const scroll_height = window.scrollY;

    console.log(scroll_height);

    if(scroll_height < 150){
        dl[0].style.opacity = '1';
        return;
    }

    if(scroll_height > div_hsum[div_hsum.length - 1] + buffer_height + (inter_height * (div_hsum.length - 1))){
        dl[dl.length - 1].style.opacity = '1';
        return;
    }

    for(let i = 0; i < div_heights.length; i++){
        // dl[i].style.position = 'relative';
        dl[i].style.opacity = '0';
        dl[i].style.zIndex = '0';
    }
    // console.log(Math.round(div_hsum[0] + buffer_height + (inter_height * 0 / 2) - snapRange), " ", Math.round(scroll_height), " ", Math.round());
    for(let i = 0; i < div_heights.length; i++){
        if(scroll_height < div_hsum[i] + buffer_height + (inter_height * i) + snapRange && scroll_height > div_hsum[i] + buffer_height + (inter_height * i)){
            // dl[i].style.position = 'sticky';
            // dl[i].style.top = `${(small_buffer_height)}px`;
            dl[i].style.opacity = '1';
            console.log(i);

            return;
        }
    }
});